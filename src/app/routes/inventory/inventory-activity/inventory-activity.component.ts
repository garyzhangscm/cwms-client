import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ClientService } from '../../common/services/client.service';
import { InventoryActivity } from '../models/inventory-activity';
import { InventoryActivityService } from '../services/inventory-activity.service';
import { ItemFamilyService } from '../services/item-family.service';

import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryStatus } from '../models/inventory-status';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';

import { formatDate } from '@angular/common'; 
import { Client } from '../../common/models/client';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { InventoryActivityType } from '../models/inventory-activity-type.enum';
import { ItemFamily } from '../models/item-family';

@Component({
  selector: 'app-inventory-inventory-activity',
  templateUrl: './inventory-activity.component.html',
  styleUrls: ['./inventory-activity.component.less'],
})
export class InventoryInventoryActivityComponent implements OnInit {

  
  listOfColumns: ColumnItem[] = [    
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
  inventoryActivityTypes!: InventoryActivityType; 
  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllInventoryActivities: InventoryActivity[] = [];
  listOfDisplayInventoryActivities: InventoryActivity[] = []; 
  

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private inventoryActivityService: InventoryActivityService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
    private utilService: UtilService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventoryActivities = [];
    this.listOfDisplayInventoryActivities = [];
 
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.inventoryActivityService
      .getInventoryActivities(
        this.searchForm.value.taggedClients,
        this.searchForm.value.taggedItemFamilies,
        this.searchForm.value.itemName,
        this.searchForm.value.location,
        this.searchForm.value.lpn,
        this.searchForm.value.type,
        this.searchForm.value.activityDateTimeRanger,
        this.searchForm.value.activityDateTimeRanger,
        this.searchForm.value.activityDate,
        this.searchForm.value.username,
      )
      .subscribe(
        inventoryActivityRes => {
          this.processInventoryActivityQueryResult(inventoryActivityRes);
          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryActivityRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  processInventoryActivityQueryResult(inventoryActivities: InventoryActivity[]): void {
    this.listOfAllInventoryActivities = inventoryActivities;
    this.listOfDisplayInventoryActivities = inventoryActivities;
 
 
 
  }

  currentPageDataChange($event: InventoryActivity[]): void {
    this.listOfDisplayInventoryActivities = $event;
  } 
  
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory-activity'));
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],
      taggedItemFamilies: [null],
      itemName: [null],
      location: [null],
      lpn: [null],
      username: [null],
      type: [null],
      activityDateTimeRanger: [null],
      activityDate: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
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
