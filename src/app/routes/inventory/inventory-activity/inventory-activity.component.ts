import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service'; 
import { WebPageTableColumnConfiguration } from '../../util/models/web-page-table-column-configuration';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service'; 
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { InventoryActivity } from '../models/inventory-activity';
import { InventoryActivityType } from '../models/inventory-activity-type.enum'; 
import { ItemFamily } from '../models/item-family'; 
import { InventoryActivityService } from '../services/inventory-activity.service';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
    selector: 'app-inventory-inventory-activity',
    templateUrl: './inventory-activity.component.html',
    styleUrls: ['./inventory-activity.component.less'],
    standalone: false
})
export class InventoryInventoryActivityComponent implements OnInit {

  inventoryActivityTablePI = 10;
  inventoryActivityTablePS = 1;
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageName = "inventory-activity";
  tableConfigurations: {[key: string]: WebPageTableColumnConfiguration[] } = {}; 
/**
 * 
 * 
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

 */

  
  @ViewChild('inventoryActivityTable', { static: false })
  inventoryActivityTable!: STComponent;
  inventoryActivityTableColumns : STColumn[] = [];
  defaultInventoryActivityTableColumns: {[key: string]: STColumn } = {

    "transactionId" : { title: this.i18n.fanyi("inventory-activity.transaction-id"), 
      index: 'transactionId' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.transactionId, b.transactionId),
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.transactionId === filter.value,
        multiple: true
      }
    },   
    "transactionGroupId" : { title: this.i18n.fanyi("inventory-activity.transaction-group-id"), 
    index: 'transactionGroupId' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.transactionGroupId, b.transactionGroupId),
      }, 
    },  
    "client" : { title: this.i18n.fanyi("client"), render: 'clientColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
      },
    },  
    "lpn" : { title: this.i18n.fanyi("lpn"), 
      index: 'lpn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.lpn, b.lpn),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.lpn === filter.value,
        multiple: true
      }
    }, 
    "item" : { title: this.i18n.fanyi("item"), 
      render: 'itemColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.item?.name === filter.value,
        multiple: true
      }
    }, 
    "itemPackageType" : { title: this.i18n.fanyi("item.package-type"), 
      render: 'itemPackageTypeColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.itemPackageType, b.itemPackageType, 'name'),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.item?.name === filter.value,
        multiple: true
      }
    }, 
    "color" : { title: this.i18n.fanyi("color"), 
      index: 'color' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.color, b.color),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.color === filter.value,
        multiple: true
      }
    }, 
    "location" : { title: this.i18n.fanyi("location"), 
      index: 'location.name' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.location.name === filter.value,
        multiple: true
      }
    }, 
    "quantity" : { title: this.i18n.fanyi("quantity"), 
      index: 'quantity' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
      },  
    }, 
    "inventoryStatus" : { title: this.i18n.fanyi("inventory.status"), 
      render: 'inventoryStatusColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.inventoryStatus.name === filter.value,
        multiple: true
      }  
    }, 
    "type" : { title: this.i18n.fanyi("inventory-activity.type"), 
      render: 'typeColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.type.toLocaleString(), b.type.toLocaleString()),
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.type.name === filter.value,
        multiple: true
      }  
    }, 
    "activityDateTime" : { title: this.i18n.fanyi("inventory-activity.date-time"), 
      render: 'activityDateTimeColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareDateTime(a.activityDateTime, b.activityDateTime),
      }, 
    }, 
    "username" : { title: this.i18n.fanyi("inventory-activity.username"), 
      index: 'username' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.username, b.username),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.username === filter.value,
        multiple: true
      }  
    }, 
    "rfCode" : { title: this.i18n.fanyi("rfCode"), 
      index: 'rfCode' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.rfCode, b.rfCode),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.rfCode === filter.value,
        multiple: true
      }  
    }, 
    "valueType" : { title: this.i18n.fanyi("inventory-activity.value-type"), 
      index: 'valueType' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.valueType, b.valueType),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.valueType === filter.value,
        multiple: true
      }  
    },
    "fromValue" : { title: this.i18n.fanyi("inventory-activity.from-value"), 
      index: 'fromValue' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.fromValue, b.fromValue),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.fromValue === filter.value,
        multiple: true
      }  
    },
    "toValue" : { title: this.i18n.fanyi("inventory-activity.to-value"), 
      index: 'toValue' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.toValue, b.toValue),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.toValue === filter.value,
        multiple: true
      }  
    },
    "documentNumber" : { title: this.i18n.fanyi("inventory-activity.document-number"), 
      index: 'documentNumber' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.documentNumber, b.documentNumber),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.documentNumber === filter.value,
        multiple: true
      }  
    },
    "comment" : { title: this.i18n.fanyi("inventory-activity.comment"), 
      index: 'comment' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.comment, b.comment),
      }, 
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.comment.includes(filter.value),
        multiple: true
      }  
    }, 
  };



  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  inventoryActivityTypes = InventoryActivityType;
  inventoryActivityTypesKeys = Object.keys(this.inventoryActivityTypes);
   
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllInventoryActivities: InventoryActivity[] = []; 

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
    private titleService: TitleService,
    private localCacheService: LocalCacheService,
    private utilService: UtilService,
    private userService: UserService,
    private companyService: CompanyService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/inventory-activity").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                        
    
    this.initWebPageTableColumnConfiguration();
  
  }
  
  initWebPageTableColumnConfiguration() {
    this.initInventoryActivityTableColumnConfiguration();
  }
  
  initInventoryActivityTableColumnConfiguration() { 

    this.localCacheService.getWebPageTableColumnConfiguration(this.pageName, "inventoryActivityTable")
    .subscribe({
      next: (webPageTableColumnConfigurationRes) => {
        if (webPageTableColumnConfigurationRes && webPageTableColumnConfigurationRes.length > 0){

          console.log(`got ${webPageTableColumnConfigurationRes.length} configuration for inventoryActivityTable `)
          this.tableConfigurations["inventoryActivityTable"] = webPageTableColumnConfigurationRes;
          this.refreshInventoryActivityTableColumns();

        }
        else {
          console.log(`start to get default configuration for inventoryActivityTable `)
          this.tableConfigurations["inventoryActivityTable"] = this.getDefaultInventoryActivityTableColumnsConfiguration();
          this.refreshInventoryActivityTableColumns();
        }
      }, 
      error: () => {
        
        this.tableConfigurations["inventoryActivityTable"] = this.getDefaultInventoryActivityTableColumnsConfiguration();
        this.refreshInventoryActivityTableColumns();
      }
    })
  }

  refreshInventoryActivityTableColumns() {
    
      if (this.tableConfigurations["inventoryActivityTable"] == null) {
        return;
      } 

      this.inventoryActivityTableColumns = [ 
      ];

      // loop through the table column configuration and add
      // the column if the display flag is checked, and by sequence
      let inventoryActivityTableConfiguration = this.tableConfigurations["inventoryActivityTable"].filter(
        column => column.displayFlag
      );

      inventoryActivityTableConfiguration.sort((a, b) => a.columnSequence - b.columnSequence);

      inventoryActivityTableConfiguration.forEach(
        columnConfig => {
          this.defaultInventoryActivityTableColumns[columnConfig.columnName].title = columnConfig.columnDisplayText;

          this.inventoryActivityTableColumns = [...this.inventoryActivityTableColumns, 
            this.defaultInventoryActivityTableColumns[columnConfig.columnName]
          ]
        }
      )
 
 

      if (this.inventoryActivityTable != null) {

        this.inventoryActivityTable.resetColumns({ emitReload: true });
      } 

  }
  

  getDefaultInventoryActivityTableColumnsConfiguration(): WebPageTableColumnConfiguration[] {
    
    return [
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "transactionId",
        columnDisplayText: this.i18n.fanyi("inventory-activity.transaction-id"),
        columnWidth: 150,
        columnSequence: 1, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "transactionGroupId",
        columnDisplayText: this.i18n.fanyi("inventory-activity.transaction-group-id"),
        columnWidth: 150,
        columnSequence: 2, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "client",
        columnDisplayText: this.i18n.fanyi("client"),
        columnWidth: 150,
        columnSequence: 3, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "lpn",
        columnDisplayText: this.i18n.fanyi("lpn"),
        columnWidth: 150,
        columnSequence: 4, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "item",
        columnDisplayText: this.i18n.fanyi("item"),
        columnWidth: 150,
        columnSequence: 5, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "itemPackageType",
        columnDisplayText: this.i18n.fanyi("item.package-type"),
        columnWidth: 150,
        columnSequence: 6, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "color",
        columnDisplayText: this.i18n.fanyi("color"),
        columnWidth: 150,
        columnSequence: 7, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "location",
        columnDisplayText: this.i18n.fanyi("location"),
        columnWidth: 150,
        columnSequence: 8, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "quantity",
        columnDisplayText: this.i18n.fanyi("quantity"),
        columnWidth: 150,
        columnSequence: 9, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "inventoryStatus",
        columnDisplayText: this.i18n.fanyi("inventory.status"),
        columnWidth: 150,
        columnSequence: 10, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "type",
        columnDisplayText: this.i18n.fanyi("type"),
        columnWidth: 150,
        columnSequence: 11, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "activityDateTime",
        columnDisplayText: this.i18n.fanyi("inventory-activity.date-time"),
        columnWidth: 150,
        columnSequence: 12, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "username",
        columnDisplayText: this.i18n.fanyi("username"),
        columnWidth: 150,
        columnSequence: 13, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "rfCode",
        columnDisplayText: this.i18n.fanyi("rfCode"),
        columnWidth: 150,
        columnSequence: 14, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "valueType",
        columnDisplayText: this.i18n.fanyi("inventory-activity.value-type"),
        columnWidth: 150,
        columnSequence: 15, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "fromValue",
        columnDisplayText: this.i18n.fanyi("inventory-activity.from-value"),
        columnWidth: 150,
        columnSequence: 16, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "toValue",
        columnDisplayText: this.i18n.fanyi("inventory-activity.to-value"),
        columnWidth: 150,
        columnSequence: 17, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "documentNumber",
        columnDisplayText: this.i18n.fanyi("inventory-activity.document-number"),
        columnWidth: 150,
        columnSequence: 18, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "inventoryActivityTable",
        columnName: "comment",
        columnDisplayText: this.i18n.fanyi("inventory-activity.comment"),
        columnWidth: 150,
        columnSequence: 19, 
        displayFlag: true
      }, 
    ]
  } 

  inventoryActivityTableColumnConfigurationChanged(tableColumnConfigurationList: WebPageTableColumnConfiguration[]){
      // console.log(`new wave table column configuration list ${tableColumnConfigurationList.length}`)
      // tableColumnConfigurationList.forEach(
      //   column => {
      //     console.log(`${JSON.stringify(column)}`)
      //   }
      // )
      this.tableConfigurations["inventoryActivity"] = tableColumnConfigurationList;
      this.refreshInventoryActivityTableColumns();
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

  }
  search(): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';
    
    let startTime : Date = this.searchForm.value.activityDateTimeRanger ? 
        this.searchForm.value.activityDateTimeRanger[0] : undefined;  
    let endTime : Date = this.searchForm.value.activityDateTimeRanger ? 
        this.searchForm.value.activityDateTimeRanger[1] : undefined; 
    let specificDate : Date = this.searchForm.value.activityDate;

    let clients : Client[] = [];
    if (this.searchForm.value.client != null) {
      clients = [this.searchForm.value.client]
    }

    this.inventoryActivityService
      .getPageableInventoryActivities(
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
        this.inventoryActivityTable.pi,
        this.inventoryActivityTable.ps
      )
      .subscribe({
        
        next: (page) => {
          this.inventoryActivityTable.total = page.totalElements;
          this.processInventoryActivityQueryResult(page.content);
          this.searching = false;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: page.totalElements,
          });
        },
        error: () => {

          this.searching = false;
          this.isSpinning = false;
          this.searchResult = '';
        }

 

      }); 
  }


  inventoryActivityTableChanged(event: STChange) : void { 
    if (event.type === 'pi' || event.type === 'ps') {
      // see if the PI or PS is changed. If so
      // we will need to redo the search since we use 
      // client size pagination
      const pipsChanged : boolean = 
          (this.inventoryActivityTablePI != this.inventoryActivityTable.pi) ||
          (this.inventoryActivityTablePS != this.inventoryActivityTable.ps);
 
      if (pipsChanged) {
        this.inventoryActivityTablePI = this.inventoryActivityTable.pi;
        this.inventoryActivityTablePS = this.inventoryActivityTable.ps;
        this.search();
      }

    }

  }

  processInventoryActivityQueryResult(inventoryActivities: InventoryActivity[]): void {
    this.listOfAllInventoryActivities = inventoryActivities; 
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

    
    this.inventoryActivityTable.reload();
 
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  async loadDetail(inventoryActivity: InventoryActivity) {
 
    this.loadClients(inventoryActivity); 
    
    this.loadLocation(inventoryActivity);
    
  }
  
  async loadClients(inventoryActivity: InventoryActivity) {
    if (inventoryActivity.clientId && inventoryActivity.client == null) {
      this.loadingDetailsRequest++;
      inventoryActivity.client =  await this.localCacheService.getClient(inventoryActivity.clientId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 

  }
  
  loadLocation(inventoryActivity: InventoryActivity) {
 
     
    if (inventoryActivity.locationId && inventoryActivity.location == null) {
      this.loadingDetailsRequest++;
      this.localCacheService.getLocation(inventoryActivity.locationId!)
      .subscribe({
        next: (locationRes) => {
          inventoryActivity.location = locationRes;
          this.loadingDetailsRequest--;

        }
      });
    } 

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
    this.searchForm.value.location.setValue(selectedLocationName);
  }
  processItemQueryResult(selectedItemName: any): void {
    this.searchForm.value.itemName.setValue(selectedItemName);
  }
}
