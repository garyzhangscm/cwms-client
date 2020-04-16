import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupType } from '../models/location-group-type';
import { LocationGroup } from '../models/location-group';
import { LocationGroupService } from '../services/location-group.service';
import { I18NService } from '@core';
import { NzInputDirective, NzModalService, NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-warehouse-layout-location-group',
  templateUrl: './location-group.component.html',
  styleUrls: ['./location-group.component.less'],
})
export class WarehouseLayoutLocationGroupComponent implements OnInit {
  // Select control for Location Group Types
  locationGroupTypes: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllLocationGroups: LocationGroup[] = [];
  listOfDisplayLocationGroups: LocationGroup[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByName = [];
  filtersByDescription = [];
  filtersByLocationGroupType = [];
  // Save filters that already selected
  selectedFiltersByName: string[] = [];
  selectedFiltersByDescription: string[] = [];
  selectedFiltersByLocationGroupType: string[] = [];

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  // editable cell
  editId: string | null;
  editCol: string | null;
  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef;

  constructor(
    private fb: FormBuilder,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllLocationGroups = [];
    this.listOfDisplayLocationGroups = [];
    this.filtersByName = [];
    this.filtersByDescription = [];
    this.filtersByLocationGroupType = [];
  }
  search(): void {
    this.locationGroupService
      .getLocationGroups(this.searchForm.controls.taggedLocationGroupTypes.value)
      .subscribe(locationGroupsRes => {
        this.listOfAllLocationGroups = locationGroupsRes;
        this.listOfDisplayLocationGroups = locationGroupsRes;

        this.filtersByName = [];
        this.filtersByDescription = [];
        this.filtersByLocationGroupType = [];

        const existingLocationGroupTypeId = new Set();

        this.listOfAllLocationGroups.forEach(locationGroup => {
          this.filtersByName.push({ text: locationGroup.name, value: locationGroup.name });
          this.filtersByDescription.push({ text: locationGroup.description, value: locationGroup.description });
          if (!existingLocationGroupTypeId.has(locationGroup.locationGroupType.id)) {
            this.filtersByLocationGroupType.push({
              text: locationGroup.locationGroupType.description,
              value: locationGroup.locationGroupType.id,
            });
            existingLocationGroupTypeId.add(locationGroup.locationGroupType.id);
          }
        });
      });
  }

  currentPageDataChange($event: LocationGroup[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocationGroups = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayLocationGroups.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayLocationGroups.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayLocationGroups.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(
    selectedFiltersByName: string[],
    selectedFiltersByDescription: string[],
    selectedFiltersByLocationGroupType: string[],
  ) {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByDescription = selectedFiltersByDescription;
    this.selectedFiltersByLocationGroupType = selectedFiltersByLocationGroupType;
    this.sortAndFilter();
  }

  sortAndFilter() {
    // filter data
    const filterFunc = (item: {
      id: number;
      name: string;
      description: string;
      locationGroupType: LocationGroupType;
    }) =>
      (this.selectedFiltersByName.length
        ? this.selectedFiltersByName.some(name => item.name.indexOf(name) !== -1)
        : true) &&
      (this.selectedFiltersByDescription.length
        ? this.selectedFiltersByDescription.some(description => item.description.indexOf(description) !== -1)
        : true) &&
      (this.selectedFiltersByLocationGroupType.length
        ? this.selectedFiltersByLocationGroupType.some(id => item.locationGroupType.id === +id)
        : true);
    const data = this.listOfAllLocationGroups.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayLocationGroups = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayLocationGroups = data;
    }
  }

  removeSelectedLocationGroups(): void {
    // make sure we have at least one checkbox checked
    const selectedLocationGroups = this.getSelectedLocationGroups();
    if (selectedLocationGroups.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.locationGroupService.removeLocationGroups(selectedLocationGroups).subscribe(res => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedLocationGroups(): LocationGroup[] {
    const selectedLocationGroups: LocationGroup[] = [];
    this.listOfAllLocationGroups.forEach((locationGroup: LocationGroup) => {
      if (this.mapOfCheckedId[locationGroup.id] === true) {
        selectedLocationGroups.push(locationGroup);
      }
    });
    return selectedLocationGroups;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }
  changeLocationGroupType(locationGroup: LocationGroup, locationGroupTypeId: string) {
    this.locationGroupTypeService
      .getLocationGroupType(+locationGroupTypeId)
      .subscribe((locationGroupType: LocationGroupType) => {
        locationGroup.locationGroupType = locationGroupType;
        this.changeLocationGroup(locationGroup);
      });
  }

  @HostListener('window:click', ['$event'])
  handleClick(e: MouseEvent): void {
    if (this.editId && this.inputElement && this.inputElement.nativeElement !== e.target) {
      this.editId = null;
    }
  }

  changeLocationGroup(locationGroup: LocationGroup) {
    this.locationGroupService
      .changeLocationGroup(locationGroup)
      .subscribe(res => this.messageService.success(this.i18n.fanyi('message.action.success')));
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
    });

    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      locationGroupTypeList.forEach(locationGroupType =>
        this.locationGroupTypes.push({ label: locationGroupType.description, value: locationGroupType.id.toString() }),
      );
    });
  }
}
