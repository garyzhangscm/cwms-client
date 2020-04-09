import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { WarehouseLocation } from '../models/warehouse-location';
import { LocationService } from '../services/location.service';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupService } from '../services/location-group.service';
import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd';
import { LocationGroupType } from '../models/location-group-type';
import { LocationGroup } from '../models/location-group';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-warehouse-layout-warehouse-location',
  templateUrl: './warehouse-location.component.html',
  styleUrls: ['./warehouse-location.component.less'],
})
export class WarehouseLayoutWarehouseLocationComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  // Select control for Location Group Types
  locationGroupTypes: Array<{ label: string; value: string }> = [];
  locationGroups: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm: FormGroup;

  searching = false;

  // Table data for display
  locations: WarehouseLocation[] = [];
  listOfDisplayLocations: WarehouseLocation[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByLocationGroup = [];
  // Save filters that already selected
  selectedFiltersByLocationGroup: string[] = [];

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.locations = [];
    this.listOfDisplayLocations = [];
    this.filtersByLocationGroup = [];
  }

  search(): void {
    console.log(`search with \n 
    this.searchForm.controls.taggedLocationGroupTypes.value: ${this.searchForm.controls.taggedLocationGroupTypes.value}\n
    this.searchForm.controls.taggedLocationGroups.value: ${this.searchForm.controls.taggedLocationGroups.value}`);

    this.searching = true;
    this.locationService
      .getLocations(
        this.searchForm.controls.taggedLocationGroupTypes.value,
        this.searchForm.controls.taggedLocationGroups.value,
        this.searchForm.controls.locationName.value,
      )
      .subscribe(locationRes => {
        this.locations = locationRes;
        this.listOfDisplayLocations = locationRes;

        this.filtersByLocationGroup = [];
        const existingLocationGroupId = new Set();

        this.locations.forEach(location => {
          if (!existingLocationGroupId.has(location.locationGroup.id)) {
            this.filtersByLocationGroup.push({ text: location.locationGroup.name, value: location.locationGroup.id });
            existingLocationGroupId.add(location.locationGroup.id);
          }
        });

        this.searching = false;
      });
  }

  currentPageDataChange($event: WarehouseLocation[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocations = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayLocations.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayLocations.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayLocations.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByLocationGroup: string[]) {
    this.selectedFiltersByLocationGroup = selectedFiltersByLocationGroup;
    this.sortAndFilter();
  }

  sortAndFilter() {
    // filter data
    const filterFunc = (item: { locationGroup: LocationGroup }) =>
      this.selectedFiltersByLocationGroup.length
        ? this.selectedFiltersByLocationGroup.some(id => item.locationGroup.id === +id)
        : true;

    const data = this.locations.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayLocations = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayLocations = data;
    }
  }

  removeSelectedLocations(): void {
    // make sure we have at least one checkbox checked
    const selectedLocations = this.getSelectedLocations();
    if (selectedLocations.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.locationService.removeLocations(selectedLocations).subscribe(res => {
            console.log('selected location groups removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedLocations(): WarehouseLocation[] {
    const selectedLocations: WarehouseLocation[] = [];
    this.locations.forEach((location: WarehouseLocation) => {
      if (this.mapOfCheckedId[location.id] === true) {
        selectedLocations.push(location);
      }
    });
    return selectedLocations;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
      taggedLocationGroups: [null],
      locationName: [null],
    });

    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      locationGroupTypeList.forEach(locationGroupType =>
        this.locationGroupTypes.push({ label: locationGroupType.description, value: locationGroupType.id.toString() }),
      );
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      locationGroupList.forEach(locationGroup =>
        this.locationGroups.push({ label: locationGroup.description, value: locationGroup.id.toString() }),
      );
    });
  }
}
