import { formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ALAIN_I18N_TOKEN, TitleService } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { I18NService } from 'src/app/core/i18n/i18n.service';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { InventoryConsolidationStrategy } from '../models/inventory-consolidation-strategy.enum';
import { ItemVolumeTrackingLevel } from '../models/item_volume_tracking_level.enum';
import { LocationGroup } from '../models/location-group';
import { LocationGroupType } from '../models/location-group-type';
import { LocationVolumeTrackingPolicy } from '../models/location-volume-tracking-policy.enum';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupService } from '../services/location-group.service';

@Component({
    selector: 'app-warehouse-layout-location-group',
    templateUrl: './location-group.component.html',
    styleUrls: ['./location-group.component.less'],
    standalone: false
})
export class WarehouseLayoutLocationGroupComponent implements OnInit {

  listOfColumns: Array<ColumnItem<LocationGroup>> = [
    {
      name: 'name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    }, {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareNullableString(a.description, b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "250px"
    }, {
      name: 'location-group-type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareNullableString(a.locationGroupType!.description, b.locationGroupType!.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "250px"
    }, {
      name: 'location-group.pickable',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.pickable, b.pickable),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    },
    {
      name: 'location-group.storable',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.storable, b.storable),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    }, {
      name: 'location-group.countable',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.countable, b.countable),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    }, {
      name: 'location-group.adjustable',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.adjustable, b.adjustable),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    }, {
      name: 'location-group.tracking-volume',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.trackingVolume, b.trackingVolume),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    }, {
      name: 'location-group.volume-tracking-policy',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareNullableString(a.volumeTrackingPolicy!.toString(), b.volumeTrackingPolicy!.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "250px"
    }, {
      name: 'location-group.inventory-consolidation-strategy',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareNullableString(a.inventoryConsolidationStrategy!.toString(), b.inventoryConsolidationStrategy!.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "250px"
    },{
      name: 'location-group.allowEmptyLocation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.allowEmptyLocation, b.allowEmptyLocation),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    },{
      name: 'location-group.allowOutboundSort',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.allowOutboundSort, b.allowOutboundSort),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    },{
      name: 'location-group.trackingLocationUtilization',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareBoolean(a.trackingLocationUtilization, b.trackingLocationUtilization),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "150px"
    },{
      name: 'location-group.itemVolumeTrackingLevel',
      showSort: true,
      sortOrder: null,
      sortFn: (a: LocationGroup, b: LocationGroup) => this.utilService.compareNullableString(a.itemVolumeTrackingLevel, b.itemVolumeTrackingLevel),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: "250px"
    },
  ];
  isSpinning = false;
  // Select control for Location Group Types
  // locationGroupTypes: Array<{ label: string; value: string }> = [];
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  locationVolumeTrackingPolicy = LocationVolumeTrackingPolicy;
  inventoryConsolidationStrategy = InventoryConsolidationStrategy;
  itemVolumeTrackingLevels = ItemVolumeTrackingLevel;
  selectedLocationGroupTypes: number[] = [];
  selectedLocationGroups: number[] = [];
  // Form related data and functions

  editCache: { [key: string]: { edit: boolean; data: LocationGroup; locationGroupTypeName: string } } = {};

  // Table data for display
  listOfAllLocationGroups: LocationGroup[] = [];
  listOfDisplayLocationGroups: LocationGroup[] = [];

  searchResult = '';
  searching = false;
  operationInProcess = false;

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private utilService: UtilService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/warehouse-layout/location-group").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                             
  }

  ngOnInit(): void {
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

    this.searchResult = '';
  }
  search(): void {
    this.searchResult = '';
    this.isSpinning = true;
    
    this.locationGroupService.getLocationGroups(this.selectedLocationGroupTypes, this.selectedLocationGroups).subscribe(
      locationGroupsRes => {
        this.setupLocationGroupRes(locationGroupsRes);
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: locationGroupsRes.length,
        });
        //this.searchResult = this.i18n.fanyi('menu.main.layout.location.group');
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }
  setupLocationGroupRes(locationGroupsRes: LocationGroup[]): void {
    this.listOfAllLocationGroups = locationGroupsRes;
    this.listOfDisplayLocationGroups = locationGroupsRes;
    this.updateEditCache();

  }

  currentPageDataChange($event: LocationGroup[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocationGroups = $event;
  }


  removeLocationGroup(id: number): void {
    // make sure we have at least one checkbox checked
    this.isSpinning = true;
    const modal: NzModalRef = this.modalService.confirm({
      nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
      nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkDanger: true,
      nzOnOk: () => {
        this.locationGroupService.removeLocationGroupById(id).subscribe(
          res => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.isSpinning = false;
            this.search();
          },

          () => (this.isSpinning = false),
        );
      },
      nzCancelText: this.i18n.fanyi('cancel'),
      nzOnCancel: () => {
        modal.close();
        this.isSpinning = false;
      },
    });
  }

  changeLocationGroup(locationGroup: LocationGroup): void {
    this.isSpinning = true;
    this.locationGroupService.changeLocationGroup(locationGroup).subscribe(
      res => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
      },
      () => {this.isSpinning = false },
      () => (this.isSpinning = false),
    );
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfAllLocationGroups.findIndex(item => item.id === +id);
    console.log(`start to cancel edit for id: ${id} and index: ${index}`);
    this.editCache[id] = {
      data: { ...this.listOfAllLocationGroups[index] },
      edit: false,
      locationGroupTypeName: this.listOfAllLocationGroups[index].locationGroupType!.name,
    };
  }

  saveRecord(id: number): void {
    const index = this.listOfAllLocationGroups.findIndex(item => item.id === +id);

    // setup the location group type if the type is changed
    if (this.editCache[id].data.locationGroupType!.name !== this.editCache[id].locationGroupTypeName) {
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
      this.editCache[item.id!] = {
        edit: false,
        data: { ...item },
        locationGroupTypeName: item.locationGroupType!.name,
      };
    });
  }
}
