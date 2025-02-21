import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild, } from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { UnitType } from '../../common/models/unit-type';
import { UnitService } from '../../common/services/unit.service';
import { WaveStatus } from '../../outbound/models/wave-status.enum';
import { ColumnItem } from '../../util/models/column-item';
import { WebPageTableColumnConfiguration } from '../../util/models/web-page-table-column-configuration';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../models/location-group';
import { LocationGroupType } from '../models/location-group-type';
import { LocationStatus } from '../models/location-status.enum';
import { WarehouseLocation } from '../models/warehouse-location';
import { CompanyService } from '../services/company.service';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupService } from '../services/location-group.service';
import { LocationService } from '../services/location.service';


@Component({
    selector: 'app-warehouse-layout-warehouse-location',
    templateUrl: './warehouse-location.component.html',
    styleUrls: ['./warehouse-location.component.less'],
    standalone: false
})
export class WarehouseLayoutWarehouseLocationComponent implements OnInit {

  pageName = "location";
  tableConfigurations: {[key: string]: WebPageTableColumnConfiguration[] } = {}; 

  copyLocationModalVisible = false;
  copyLocationForm!: UntypedFormGroup;
  copyFromLocation?: WarehouseLocation;
  
  @ViewChild('locationTable', { static: false })
  locationTable!: STComponent;
  locationTableColumns : STColumn[] = [];
  defaultLocationTableColumns: {[key: string]: STColumn } = {

    "name" : { title: this.i18n.fanyi("location.name"), index: 'name' , width: 150, 
      sort: {
        compare: (a, b) => a.name.localeCompare(b.name)
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.name === filter.value,
        multiple: true
      }
    },   
    "locationGroup" : { title: this.i18n.fanyi("location-group"), index: 'locationGroup.name' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.locationGroup, b.locationGroup, 'name')
      }, 
    },  
    "pickZone" : { title: this.i18n.fanyi("pick-zone"), index: 'pickZone.name', width: 150,  
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.pickZone, b.pickZone, 'name'),
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.status === filter.value,
        multiple: true
      }
    },   
    "aisle" : { title: this.i18n.fanyi("location.aisle"), index: 'aisle', width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.aisle, b.aisle),
      },
    },  
    "length" : { title: this.i18n.fanyi("location.length"), index: 'length' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.length, b.length),
      },
    },  
    "width" : { title: this.i18n.fanyi("location.width"), index: 'width' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.width, b.width),
      },
    },  
    "height" : { title: this.i18n.fanyi("location.height"), index: 'height' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.height, b.height),
      },
    },  
    "capacity" : { title: this.i18n.fanyi("location.capacity"), index: 'capacity' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.capacity, b.capacity),
      },
    }, 
    "fillPercentage" : { title: this.i18n.fanyi("location.fillPercentage"), index: 'fillPercentage' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.fillPercentage, b.fillPercentage),
      },
    }, 
    "currentVolume" : { title: this.i18n.fanyi("location.currentVolume"), index: 'currentVolume' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.currentVolume, b.currentVolume),
      },
    }, 
    "pendingVolume" : { title: this.i18n.fanyi("location.pendingVolume"), index: 'pendingVolume' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.pendingVolume, b.pendingVolume),
      },
    }, 
    "putawaySequence" : { title: this.i18n.fanyi("location.putawaySequence"), index: 'putawaySequence' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.putawaySequence, b.putawaySequence),
      },
    }, 
    "pickSequence" : { title: this.i18n.fanyi("location.pickSequence"), index: 'pickSequence' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.pickSequence, b.pickSequence),
      },
    }, 
    "countSequence" : { title: this.i18n.fanyi("location.countSequence"), index: 'countSequence' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.countSequence, b.countSequence),
      },
    }, 
    "enabled" : { title: this.i18n.fanyi("enabled"), index: 'enabled', width: 100,  
      sort: {
        compare: (a, b) => this.utilService.compareBoolean(a.enabled, b.enabled),
      },
      filter: {
        menus:  [
          { text: this.i18n.fanyi('yes'), value: true},
          { text: this.i18n.fanyi('no'), value: false},
        ] ,
        fn: (filter, record) => record.enabled === filter.value,
        multiple: true
      }
    },        
    "locked" : { title: this.i18n.fanyi("locked"), index: 'locked', width: 100,  
      sort: {
        compare: (a, b) => this.utilService.compareBoolean(a.locked, b.locked),
      },
      filter: {
        menus:  [
          { text: this.i18n.fanyi('yes'), value: true},
          { text: this.i18n.fanyi('no'), value: false},
        ] ,
        fn: (filter, record) => record.locked === filter.value,
        multiple: true
      }
    },  
    "reservedCode" : { title: this.i18n.fanyi("location.reservedCode"), index: 'reservedCode' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.reservedCode, b.reservedCode),
      },
    }, 
   
  };
  
  // Select control for Location Group Types
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllLocations: WarehouseLocation[] = []; 
 
  loadingLocationDetailsRequest = 0;

  locationStatuses = LocationStatus;

  isSpinning = false;

  displayOnly = false;
  
  // initial the user permission map so that all the permission is disable
  // by default
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['modify-location', false],
    ['copy-location', false],
  ]);
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private unitService: UnitService,
    private userService: UserService,
    private localCacheService: LocalCacheService, 
    private companyService: CompanyService,
  ) { 
    userService.isCurrentPageDisplayOnly("/warehouse-layout/warehouse-location").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                  
    userService.getUserPermissionByWebPage("/warehouse-layout/warehouse-location").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    });     
    
    this.initWebPageTableColumnConfiguration();                  
  
  }
  
  initWebPageTableColumnConfiguration() {
    this.initLocationTableColumnConfiguration();
  }
  
  initLocationTableColumnConfiguration() {
    // console.log(`start to init wave table columns`);
    this.localCacheService.getWebPageTableColumnConfiguration(this.pageName, "locationTable")
    .subscribe({
      next: (webPageTableColumnConfigurationRes) => {
        
        if (webPageTableColumnConfigurationRes && webPageTableColumnConfigurationRes.length > 0){

          this.tableConfigurations["locationTable"] = webPageTableColumnConfigurationRes;
          this.refreshLocationTableColumns();

        }
        else {
          this.tableConfigurations["locationTable"] = this.getDefaultLocationTableColumnsConfiguration();
          this.refreshLocationTableColumns();
        }
      }, 
      error: () => {
        
        this.tableConfigurations["locationTable"] = this.getDefaultLocationTableColumnsConfiguration();
        this.refreshLocationTableColumns();
      }
    })
  }

  refreshLocationTableColumns() {
    
      if (this.tableConfigurations["locationTable"] == null) {
        return;
      }
      
      // checkbox
      this.locationTableColumns = [
        { title: '', index: 'name', type: 'checkbox' },
      ];

      // loop through the table column configuration and add
      // the column if the display flag is checked, and by sequence
      let locationTableConfiguration = this.tableConfigurations["locationTable"].filter(
        column => column.displayFlag
      );

      locationTableConfiguration.sort((a, b) => a.columnSequence - b.columnSequence);

      locationTableConfiguration.forEach(
        columnConfig => {
          this.defaultLocationTableColumns[columnConfig.columnName].title = columnConfig.columnDisplayText;

          this.locationTableColumns = [...this.locationTableColumns, 
            this.defaultLocationTableColumns[columnConfig.columnName]
          ]
        }
      )

      this.locationTableColumns = [...this.locationTableColumns,  
        {
          title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
          render: 'actionColumn',
          iif: () => !this.displayOnly
        }, 
      ]; 

      if (this.locationTable != null) {

        this.locationTable.resetColumns({ emitReload: true });
      } 


  }
 
  getDefaultLocationTableColumnsConfiguration(): WebPageTableColumnConfiguration[] {
    
    return [
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "name",
        columnDisplayText: this.i18n.fanyi("locatoin.name"),
        columnWidth: 150,
        columnSequence: 1, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "locationGroup",
        columnDisplayText: this.i18n.fanyi("location-group"),
        columnWidth: 150,
        columnSequence: 2, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "pickZone",
        columnDisplayText: this.i18n.fanyi("pick-zone"),
        columnWidth: 150,
        columnSequence: 3, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "aisle",
        columnDisplayText: this.i18n.fanyi("location.aisle"),
        columnWidth: 150,
        columnSequence: 4, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "length",
        columnDisplayText: this.i18n.fanyi("locatoin.length"),
        columnWidth: 150,
        columnSequence: 5, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "width",
        columnDisplayText: this.i18n.fanyi("locatoin.width"),
        columnWidth: 150,
        columnSequence: 6, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "height",
        columnDisplayText: this.i18n.fanyi("locatoin.height"),
        columnWidth: 150,
        columnSequence: 7, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "capacity",
        columnDisplayText: this.i18n.fanyi("locatoin.capacity"),
        columnWidth: 150,
        columnSequence: 8, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "fillPercentage",
        columnDisplayText: this.i18n.fanyi("locatoin.fillPercentage"),
        columnWidth: 150,
        columnSequence: 8, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "currentVolume",
        columnDisplayText: this.i18n.fanyi("locatoin.currentVolume"),
        columnWidth: 150,
        columnSequence: 9, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "pendingVolume",
        columnDisplayText: this.i18n.fanyi("locatoin.pendingVolume"),
        columnWidth: 150,
        columnSequence: 10, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "putawaySequence",
        columnDisplayText: this.i18n.fanyi("locatoin.putawaySequence"),
        columnWidth: 150,
        columnSequence: 11, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "pickSequence",
        columnDisplayText: this.i18n.fanyi("locatoin.pickSequence"),
        columnWidth: 150,
        columnSequence: 12, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "countSequence",
        columnDisplayText: this.i18n.fanyi("locatoin.countSequence"),
        columnWidth: 150,
        columnSequence: 13, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "enabled",
        columnDisplayText: this.i18n.fanyi("locatoin.enabled"),
        columnWidth: 150,
        columnSequence: 14, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "locked",
        columnDisplayText: this.i18n.fanyi("locatoin.locked"),
        columnWidth: 150,
        columnSequence: 15, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "locationTable",
        columnName: "reservedCode",
        columnDisplayText: this.i18n.fanyi("locatoin.reservedCode"),
        columnWidth: 150,
        columnSequence: 16, 
        displayFlag: true
      }, 
    ]
  } 

  locationTableColumnConfigurationChanged(tableColumnConfigurationList: WebPageTableColumnConfiguration[]){
      // console.log(`new wave table column configuration list ${tableColumnConfigurationList.length}`)
      // tableColumnConfigurationList.forEach(
      //   column => {
      //     console.log(`${JSON.stringify(column)}`)
      //   }
      // )
      this.tableConfigurations["locationTable"] = tableColumnConfigurationList;
      this.refreshLocationTableColumns();
  }
  

  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
      taggedLocationGroups: [null],
      locationName: [null],
      // locationStatus: [null],
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

  }

  search(): void {
    this.isSpinning = true;
    this.locationService
      .getLocations(
        this.searchForm.controls.taggedLocationGroupTypes.value,
        this.searchForm.controls.taggedLocationGroups.value,
        this.searchForm.controls.locationName.value,
        undefined,
        // this.searchForm.controls.locationStatus.value,
      )
      .subscribe(
        locationRes => {
          this.loadUnits(locationRes);
          this.listOfAllLocations = locationRes;  


          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: locationRes.length,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
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
    let selectedWarehouseLocations: WarehouseLocation[] = [];
    
    const dataList: STData[] = this.locationTable.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedWarehouseLocations = [...selectedWarehouseLocations,
              ...this.listOfAllLocations.filter(
                location => location.id == data["id"]
              )
          ]

        }
      );
    return selectedWarehouseLocations;
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

  
  cancelCopyLocation() {

    this.copyLocationModalVisible = false;
    this.copyFromLocation = undefined;
  }
  
  openCopyLocationModal(currentLocation: WarehouseLocation) {
    this.copyLocationModalVisible = true;
    this.copyFromLocation = currentLocation;
  
    this.copyLocationForm = this.fb.group({
      currentLocation: [null], 
      prefix: [null], 
      startNumber: [null], 
      endNumber: [null], 
      postfix: [null], 
    });

  }
  copyLocation() {
    this.isSpinning = true;
    this.locationService.copyLocation(this.copyFromLocation!.id!,
      this.copyLocationForm.controls.startNumber.value,
      this.copyLocationForm.controls.endNumber.value,
      this.copyLocationForm.controls.prefix.value,
      this.copyLocationForm.controls.postfix.value).subscribe({
        next: () => {
          this.isSpinning = false;
          this.copyLocationModalVisible = false;
          this.copyFromLocation = undefined;
          this.search();

        }, 
        error: () => this.isSpinning = false
      })

  }
}
