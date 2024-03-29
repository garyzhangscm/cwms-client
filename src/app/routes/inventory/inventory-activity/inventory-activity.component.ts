import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service'; 
import { InventoryActivity } from '../models/inventory-activity';
import { InventoryActivityType } from '../models/inventory-activity-type.enum'; 
import { ItemFamily } from '../models/item-family'; 
import { InventoryActivityService } from '../services/inventory-activity.service';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
  selector: 'app-inventory-inventory-activity',
  templateUrl: './inventory-activity.component.html',
  styleUrls: ['./inventory-activity.component.less'],
})
export class InventoryInventoryActivityComponent implements OnInit {


  listOfColumns: Array<ColumnItem<InventoryActivity>> = [
    {
      name: 'inventory-activity.transaction-id',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.transactionId, b.transactionId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'inventory-activity.transaction-group-id',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.transactionGroupId, b.transactionGroupId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'client',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableNumber(a.clientId, b.clientId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'lpn',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.lpn, b.lpn),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.package-type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableObjField(a.itemPackageType, b.itemPackageType, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.type.toLocaleString(), b.type.toLocaleString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.date-time',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareDateTime(a.activityDateTime, b.activityDateTime),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.username',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.username, b.username),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'rfCode',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.rfCode, b.rfCode),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.value-type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.valueType, b.valueType),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.from-value',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.fromValue, b.fromValue),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.to-value',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.toValue, b.toValue),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.document-number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.documentNumber, b.documentNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory-activity.comment',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryActivity, b: InventoryActivity) => this.utilService.compareNullableString(a.comment, b.comment),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  inventoryActivityTypes = InventoryActivityType;
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllInventoryActivities: InventoryActivity[] = [];
  listOfDisplayInventoryActivities: InventoryActivity[] = [];

  availableClients: Client[] = [];
  threePartyLogisticsFlag = false;

  isCollapse = false;
  isSpinning = false;

  loadingDetailsRequest = 0;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private inventoryActivityService: InventoryActivityService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private titleService: TitleService,
    private localCacheService: LocalCacheService,
    private utilService: UtilService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/inventory-activity").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                        
  
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory-activity'));
    this.initSearchForm();

    
    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });
    
    this.initClientAssignment();
  }
  
  initClientAssignment(): void {
    
    this.isSpinning = true;
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
    
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventoryActivities = [];
    this.listOfDisplayInventoryActivities = [];

  }
  search(): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';
    
    let startTime : Date = this.searchForm.controls.activityDateTimeRanger.value ? 
        this.searchForm.controls.activityDateTimeRanger.value[0] : undefined;  
    let endTime : Date = this.searchForm.controls.activityDateTimeRanger.value ? 
        this.searchForm.controls.activityDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.activityDate.value;

    let clients : Client[] = [];
    if (this.searchForm.value.client != null) {
      clients = [this.searchForm.value.client]
    }

    this.inventoryActivityService
      .getInventoryActivities(
        clients,
        this.searchForm.value.taggedItemFamilies,
        this.searchForm.value.itemName,
        this.searchForm.value.location,
        this.searchForm.value.lpn,
        this.searchForm.value.type,
        startTime,
        endTime,        
        specificDate,
        this.searchForm.value.username,
        this.searchForm.value.rfCode,  
      )
      .subscribe(
        inventoryActivityRes => {
          this.processInventoryActivityQueryResult(inventoryActivityRes);
          this.searching = false;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryActivityRes.length,
          });
        },
        () => {
          this.searching = false;
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }


  processInventoryActivityQueryResult(inventoryActivities: InventoryActivity[]): void {
    this.listOfAllInventoryActivities = inventoryActivities;
    this.listOfDisplayInventoryActivities = inventoryActivities;
    this.loadDetails(inventoryActivities)


  }

  
  // we will load the information 
  // asyncronized
  async loadDetails(inventoryActivities: InventoryActivity[]) {
 
    let index = 0;
    this.loadingDetailsRequest = 0;

    
    while (index < inventoryActivities.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 inventory at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many inventory into the server at a time 
      
      
      while(this.loadingDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      await this.loadDetail(inventoryActivities[index]);
      index++;
    } 
    while(this.loadingDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
 
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  async loadDetail(inventoryActivity: InventoryActivity) {
 
    this.loadClients(inventoryActivity); 
    
  }
  
  async loadClients(inventoryActivity: InventoryActivity) {
    if (inventoryActivity.clientId && inventoryActivity.client == null) {
      this.loadingDetailsRequest++;
      inventoryActivity.client =  await this.localCacheService.getClient(inventoryActivity.clientId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 

  }

  currentPageDataChange($event: InventoryActivity[]): void {
    this.listOfDisplayInventoryActivities = $event;
  }


  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      client: [null],
      taggedItemFamilies: [null],
      itemName: [null],
      location: [null],
      lpn: [null],
      username: [null],
      type: [null],
      rfCode: [null],
      activityDateTimeRanger: [null],
      activityDate: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id!.toString() }));
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }

  processLocationQueryResult(selectedLocationName: any): void {
    this.searchForm.controls.location.setValue(selectedLocationName);
  }
  processItemQueryResult(selectedItemName: any): void {
    this.searchForm.controls.itemName.setValue(selectedItemName);
  }
}
