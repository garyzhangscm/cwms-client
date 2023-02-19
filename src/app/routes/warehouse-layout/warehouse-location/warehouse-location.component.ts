import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UnitType } from '../../common/models/unit-type';
import { UnitService } from '../../common/services/unit.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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

  listOfColumns: Array<ColumnItem<WarehouseLocation>> = [
    {
      name: 'location.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      fixToTheLeft: true,
      width: "150px"
    }, {
      name: 'location-group',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableObjField(a.locationGroup, b.locationGroup, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '200px'
    }, {
      name: 'location.aisle',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableString(a.aisle, b.aisle),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.length',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.length, b.length),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.width',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.width, b.width),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.height',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.height, b.height),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.capacity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.capacity, b.capacity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.fillPercentage',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.fillPercentage, b.fillPercentage),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.currentVolume',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.currentVolume, b.currentVolume),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.pendingVolume',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.pendingVolume, b.pendingVolume),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.putawaySequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.putawaySequence, b.putawaySequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.pickSequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.pickSequence, b.pickSequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    }, {
      name: 'location.countSequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.countSequence, b.countSequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    },
    {
      name: 'enabled',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], warehouseLocation: WarehouseLocation) => list.some(enabled => warehouseLocation.enabled === enabled),
      showFilter: true,
      width: '100px'
    },
    {
      name: 'locked',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareBoolean(a.locked, b.locked),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], warehouseLocation: WarehouseLocation) => list.some(locked => warehouseLocation.locked === locked),
      showFilter: true,
      width: '100px'
    }, {
      name: 'location.reservedCode',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableString(a.reservedCode, b.reservedCode),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '100px'
    },
  ];
  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  scrollX = '100vw';

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

  // count for loading location details
  // 
  loadingLocationDetailsRequest = 0;


  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private unitService: UnitService,
  ) { }
  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
      taggedLocationGroups: [null],
      locationName: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.locationName.setValue(params.name);
        this.search();
      } 
    });

    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      this.locationGroupTypes = locationGroupTypeList;
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });
  }

  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async loadUnits(locations: WarehouseLocation[]) {
    
    // const currentPageOrders = this.getCurrentPageOrders(); 
    let index = 0;
    this.loadingLocationDetailsRequest = 0;
    while (index < locations.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 orders at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time
      // console.log(`1. this.loadingOrderDetailsRequest: ${this.loadingOrderDetailsRequest}`);
      
      
      while(this.loadingLocationDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.loadUnit(locations[index]);
      index++;
    }  
  }
  loadUnit(location: WarehouseLocation) : void {
    // backwards compatibility, in case the unit of the width / length / height
    // and capacity is not setup yet. we will load the default unit 

    if (!location.lengthUnit) {
      this.loadLengthUnit(location, "lengthUnit");
    }
    if (!location.widthUnit) {
      this.loadLengthUnit(location, "widthUnit");
    }
    if (!location.heightUnit) {
      this.loadLengthUnit(location, "heightUnit");
    }
    if (!location.capacityUnit) {
      this.loadVolumeUnit(location, "capacityUnit");
    }
  }

  loadLengthUnit(obj: any, key: string) {
    this.loadUnitByType(obj, key, UnitType.LENGTH) 
  }
  loadVolumeUnit(obj: any, key: string) {
    this.loadUnitByType(obj, key, UnitType.VOLUME) 
  }
  
  loadUnitByType(obj: any, key: string, unitType: UnitType) {
    
    this.loadingLocationDetailsRequest++;
    this.unitService.loadUnits().subscribe({
      next: (unitsRes) => {
        unitsRes.forEach(
          unit => {
            if (unit.type === unitType && unit.baseUnitFlag === true) {
              obj[key] = unit.name; 
            }
          }
        )
        this.loadingLocationDetailsRequest--;
      }, 
      error: () => this.loadingLocationDetailsRequest--
    })    
  }


  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllLocations = [];
    this.listOfDisplayLocations = [];

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
          this.loadUnits(locationRes);
          this.listOfAllLocations = locationRes;
          this.listOfDisplayLocations = locationRes;
          this.updateEditCache();


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

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayLocations!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: WarehouseLocation[]): void {
    this.listOfDisplayLocations! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayLocations!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayLocations!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }


  removeSelectedLocations(): void {
    // make sure we have at least one checkbox checked
    const selectedLocations = this.getSelectedLocations();
    if (selectedLocations.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
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
      if (this.setOfCheckedId.has(location.id!)) {
        selectedLocations.push(location);
      }
    });
    return selectedLocations;
  }

  startEdit(id: number): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: number): void {
    const index = this.listOfAllLocations.findIndex(item => item.id === +id);
    this.editCache[id] = {
      data: { ...this.listOfAllLocations[index] },
      edit: false,
      locationGroupName: this.listOfAllLocations[index].locationGroup!.name!,
    };
  }

  saveRecord(id: number): void {
    const index = this.listOfAllLocations.findIndex(item => item.id === +id);

    // setup the location group type if the type is changed
    if (this.editCache[id].data.locationGroup!.name !== this.editCache[id].locationGroupName) {
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
      this.editCache[item.id!] = {
        edit: false,
        data: { ...item },
        locationGroupName: item.locationGroup!.name!,
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
