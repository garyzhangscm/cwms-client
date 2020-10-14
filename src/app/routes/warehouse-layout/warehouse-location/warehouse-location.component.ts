import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { LocationGroup } from '../models/location-group';
import { LocationGroupType } from '../models/location-group-type';
import { WarehouseLocation } from '../models/warehouse-location';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupService } from '../services/location-group.service';
import { LocationService } from '../services/location.service';
 

@Component({
  selector: 'app-warehouse-layout-warehouse-location',
  templateUrl: './warehouse-location.component.html',
  styleUrls: ['./warehouse-location.component.less'],
})
export class WarehouseLayoutWarehouseLocationComponent implements OnInit {
  editCache: { [key: string]: { edit: boolean; data: WarehouseLocation; locationGroupName: string } } = {};
  // Select control for Location Group Types
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
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

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
  ) {}
  ngOnInit(): void {
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
          this.listOfAllLocations = locationRes;
          this.listOfDisplayLocations = locationRes;
          this.updateEditCache();

          this.filtersByLocationGroup = [];
          const existingLocationGroupId = new Set();
 
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

    // sort data 
  }

  removeSelectedLocations(): void {
    // make sure we have at least one checkbox checked
    const selectedLocations = this.getSelectedLocations();
    if (selectedLocations.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.locationService.removeLocations(selectedLocations).subscribe(res => {
            console.log('selected location groups removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedLocations(): WarehouseLocation[] {
    const selectedLocations: WarehouseLocation[] = [];
    this.listOfAllLocations.forEach((location: WarehouseLocation) => {
      if (this.mapOfCheckedId[location.id] === true) {
        selectedLocations.push(location);
      }
    });
    return selectedLocations;
  }

  startEdit(id: string): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: string): void {
    const index = this.listOfAllLocations.findIndex(item => item.id === +id);
    this.editCache[id] = {
      data: { ...this.listOfAllLocations[index] },
      edit: false,
      locationGroupName: this.listOfAllLocations[index].locationGroup.name,
    };
  }

  saveRecord(id: string): void {
    const index = this.listOfAllLocations.findIndex(item => item.id === +id);

    // setup the location group type if the type is changed
    if (this.editCache[id].data.locationGroup.name !== this.editCache[id].locationGroupName) {
      const matchedLocationGroup = this.locationGroups.filter(locationGroup => {
        return locationGroup.name === this.editCache[id].locationGroupName;
      });
      if (matchedLocationGroup.length > 0) {
        this.editCache[id].data.locationGroup = matchedLocationGroup[0];
      }
    }
    Object.assign(this.listOfAllLocations[index], this.editCache[id].data);

    // we will
    this.changeLocation(this.listOfAllLocations[index]);
    this.editCache[id].edit = false;
  }

  updateEditCache(): void {
    this.listOfAllLocations.forEach(item => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
        locationGroupName: item.locationGroup.name,
      };
    });
  }

  changeLocation(location: WarehouseLocation): void {
    this.locationService
      .changeLocation(location)
      .subscribe(res => this.messageService.success(this.i18n.fanyi('message.action.success')));
  }
  processLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.searchForm.controls.locationName.setValue(selectedLocationName); 
  }
}
