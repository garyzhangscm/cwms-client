import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupType } from '../models/location-group-type';
import { LocationGroup } from '../models/location-group';
import { LocationGroupService } from '../services/location-group.service';
import { I18NService } from '@core';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LocationVolumeTrackingPolicy } from '../models/location-volume-tracking-policy.enum';
import { InventoryConsolidationStrategy } from '../models/inventory-consolidation-strategy.enum';
import { ActivatedRoute } from '@angular/router';
import { TitleService } from '@delon/theme';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-warehouse-layout-location-group',
  templateUrl: './location-group.component.html',
  styleUrls: ['./location-group.component.less'],
})
export class WarehouseLayoutLocationGroupComponent implements OnInit {
  // Select control for Location Group Types
  // locationGroupTypes: Array<{ label: string; value: string }> = [];
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  locationVolumeTrackingPolicy = LocationVolumeTrackingPolicy;
  inventoryConsolidationStrategy = InventoryConsolidationStrategy;
  selectedLocationGroupTypes = [];
  selectedLocationGroups = [];
  // Form related data and functions

  editCache: { [key: string]: { edit: boolean; data: LocationGroup; locationGroupTypeName: string } } = {};

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

  searchResult = '';
  searching = false;
  operationInProcess = false;

  constructor(
    private fb: FormBuilder,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.layout.location.group'));
    // initiate the search form
    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      this.locationGroupTypes = locationGroupTypeList;
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;

      // after we load all the valid location groups, if the URL has a specific parameter,
      // let's query by this id
      this.activatedRoute.queryParams.subscribe(params => {
        if (params.id) {
          this.selectedLocationGroups = [params.id];
          this.search();
        }
      });
    });
  }

  resetForm(): void {
    this.selectedLocationGroupTypes = [];
    this.selectedLocationGroups = [];
    this.listOfAllLocationGroups = [];
    this.listOfDisplayLocationGroups = [];
    this.filtersByName = [];
    this.filtersByDescription = [];
    this.filtersByLocationGroupType = [];

    this.searchResult = '';
  }
  search(): void {
    this.searchResult = '';
    this.searching = true;
    this.locationGroupService.getLocationGroups(this.selectedLocationGroupTypes, this.selectedLocationGroups).subscribe(
      locationGroupsRes => {
        this.setupLocationGroupRes(locationGroupsRes);
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: locationGroupsRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }
  setupLocationGroupRes(locationGroupsRes: LocationGroup[]) {
    this.listOfAllLocationGroups = locationGroupsRes;
    this.listOfDisplayLocationGroups = locationGroupsRes;
    this.updateEditCache();

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
  }

  currentPageDataChange($event: LocationGroup[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocationGroups = $event;
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

  removeLocationGroup(id: number): void {
    // make sure we have at least one checkbox checked
    this.operationInProcess = true;
    const modal: NzModalRef = this.modalService.confirm({
      nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
      nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkType: 'danger',
      nzOnOk: () => {
        this.locationGroupService.removeLocationGroupById(id).subscribe(
          res => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.operationInProcess = false;
            this.search();
          },

          () => (this.operationInProcess = false),
        );
      },
      nzCancelText: this.i18n.fanyi('cancel'),
      nzOnCancel: () => {
        modal.close();
        this.operationInProcess = false;
      },
    });
  }

  changeLocationGroup(locationGroup: LocationGroup) {
    this.operationInProcess = true;
    this.locationGroupService.changeLocationGroup(locationGroup).subscribe(
      res => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
      },
      () => {},
      () => (this.operationInProcess = false),
    );
  }

  startEdit(id: string): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: string): void {
    const index = this.listOfAllLocationGroups.findIndex(item => item.id === +id);
    this.editCache[id] = {
      data: { ...this.listOfAllLocationGroups[index] },
      edit: false,
      locationGroupTypeName: this.listOfAllLocationGroups[index].locationGroupType.name,
    };
  }

  saveRecord(id: string): void {
    const index = this.listOfAllLocationGroups.findIndex(item => item.id === +id);

    // setup the location group type if the type is changed
    if (this.editCache[id].data.locationGroupType.name !== this.editCache[id].locationGroupTypeName) {
      const matchedLocationGroupType = this.locationGroupTypes.filter(locationGroupType => {
        return locationGroupType.name === this.editCache[id].locationGroupTypeName;
      });
      if (matchedLocationGroupType.length > 0) {
        this.editCache[id].data.locationGroupType = matchedLocationGroupType[0];
      }
    }
    Object.assign(this.listOfAllLocationGroups[index], this.editCache[id].data);

    // we will
    this.changeLocationGroup(this.listOfAllLocationGroups[index]);
    this.editCache[id].edit = false;
  }

  updateEditCache(): void {
    this.listOfAllLocationGroups.forEach(item => {
      this.editCache[item.id] = {
        edit: false,
        data: { ...item },
        locationGroupTypeName: item.locationGroupType.name,
      };
    });
  }
}
