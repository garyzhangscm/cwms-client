import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { LocationGroup } from '../models/location-group';
import { LocationGroupType } from '../models/location-group-type';
import { WarehouseLocation } from '../models/warehouse-location';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupService } from '../services/location-group.service';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-warehouse-layout-location-query-popup',
  templateUrl: './location-query-popup.component.html',
})
export class WarehouseLayoutLocationQueryPopupComponent implements OnInit {
  isVisible = false;

  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  // Form related data and functions
  queryModal!: NzModalRef;
  searchForm!: FormGroup;

  searching = false;
  queryInProcess = false;
  searchResult = '';

  // Table data for display
  listOfAllLocations: WarehouseLocation[] = [];
  listOfDisplayLocations: WarehouseLocation[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByLocationGroup = [];
  // Save filters that already selected
  selectedFiltersByLocationGroup: string[] = [];

  // list of checked checkbox
  mapOfCheckedId: { [key: number]: boolean } = {};

  @Output() recordSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  ngOnInit(): void {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllLocations = [];
    this.listOfDisplayLocations = [];
    this.filtersByLocationGroup = [];
  }

  search(): void {
    this.searching = true;
    this.locationService
      .getLocations(
        this.searchForm.controls.taggedLocationGroupTypes.value,
        this.searchForm.controls.taggedLocationGroups.value,
        this.searchForm.controls.locationName.value,
      )
      .subscribe(
        locationRes => {
          this.filtersByLocationGroup = [];
          const existingLocationGroupId = new Set();

          locationRes.forEach(location => { 
            this.mapOfCheckedId[location.id] = false;
          });

          this.listOfAllLocations = locationRes;
          this.listOfDisplayLocations = locationRes;

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: locationRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  currentPageDataChange($event: WarehouseLocation[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByLocationGroup: string[]): void {
    this.selectedFiltersByLocationGroup = selectedFiltersByLocationGroup;
    this.sortAndFilter();
  }

  sortAndFilter(): void {
    // filter data
    const filterFunc = (item: { locationGroup: LocationGroup }) =>
      this.selectedFiltersByLocationGroup.length
        ? this.selectedFiltersByLocationGroup.some(id => item.locationGroup.id === +id)
        : true;

    const data = this.listOfAllLocations.filter(item => filterFunc(item));
 
  }
  clearAllCheckedBox(): void {
    this.listOfAllLocations.forEach(location => {
      this.mapOfCheckedId[location.id] = false;
    });
  }

  checkedBoxChanged(recordId: number, checked: boolean): void {
    // uncheck all the checked box.
    // We will only allow one checked record
    this.clearAllCheckedBox();
    console.log(`id ${recordId} changed to ${checked}`);
    this.mapOfCheckedId[recordId] = checked;
  }
  isAnyRecordChecked(): boolean {
    return this.listOfDisplayLocations.some(location => (this.mapOfCheckedId[location.id] = true));
  }

  openQueryModal(
    tplQueryModalTitle: TemplateRef<{}>,
    tplQueryModalContent: TemplateRef<{}>,
    tplQueryModalFooter: TemplateRef<{}>,
  ): void {
    this.createQueryForm();

    // show the model
    this.queryModal = this.modalService.create({
      nzTitle: tplQueryModalTitle,
      nzContent: tplQueryModalContent,
      nzFooter: tplQueryModalFooter,

      nzWidth: 1000,
    });
  }
  createQueryForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
      taggedLocationGroups: [null],
      locationName: [null],
    });

    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      this.locationGroupTypes = locationGroupTypeList;
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });
  }
  closeQueryModal(): void {
    this.queryModal.destroy();
  }
  returnResult(): void {
    // get the selected record
    if (this.isAnyRecordChecked()) {
      this.recordSelected.emit(
        this.listOfDisplayLocations.filter(location => (this.mapOfCheckedId[location.id] = true))[0].name,
      );
    } else {
      this.recordSelected.emit('');
    }
    this.queryModal.destroy();
  }
}
