import { DatePipe, formatDate } from '@angular/common';
import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { BillableActivityType } from '../../billing/models/billable-activity-type';
import { BillableActivityTypeService } from '../../billing/services/billable-activity-type.service';
import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { ClientService } from '../../common/services/client.service';
import { SupplierService } from '../../common/services/supplier.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure'; 
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Receipt } from '../models/receipt';
import { ReceiptBillableActivity } from '../models/receipt-billable-activity';
import { ReceiptLine } from '../models/receipt-line';
import { ReceiptLineBillableActivity } from '../models/receipt-line-billable-activity';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { ReceiptService } from '../services/receipt.service';
import * as XLSX from 'xlsx';
import { ReceiptLineService } from '../services/receipt-line.service';
import { ItemService } from '../../inventory/services/item.service';
import { ReceivingTransactionService } from '../services/receiving-transaction.service';
import { DateTimeService } from '../../util/services/date-time.service';
import { WebPageTableColumnConfiguration } from '../../util/models/web-page-table-column-configuration';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Item } from '../../inventory/models/item';

@Component({
    selector: 'app-inbound-receipt',
    templateUrl: './receipt.component.html',
    styleUrls: ['./receipt.component.less'],
    standalone: false
})
export class InboundReceiptComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageName = "receipt";
  tableConfigurations: {[key: string]: WebPageTableColumnConfiguration[] } = {}; 
  
  receiptTableColumns: STColumn[] = [];
  
  defaultReceiptTableColumns: {[key: string]: STColumn } = {

    "number" : { title: this.i18n.fanyi("receipt.number"), render: 'numberColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.number, b.number)
      },
      
    },   
    "client" : { title: this.i18n.fanyi("client"), render: 'clientColumn' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
      }, 
    },  
    "supplier" : { title: this.i18n.fanyi("supplier"), render: 'supplierColumn', width: 150,  
      sort: {
        compare: (a, b) => this.utilService.compareNullableObjField(a.supplier, b.supplier, 'name'),
      },
    },   
    "status" : { title: this.i18n.fanyi("status"), render: 'statusColumn', width: 150,  
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.status, b.status),
      },
    },   
    "totalLineCount" : { title: this.i18n.fanyi("receipt.totalLineCount"), index: 'totalLineCount', width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.totalLineCount, b.totalLineCount),
      },
    },  
    "totalItemCount" : { title: this.i18n.fanyi("receipt.totalItemCount"), index: 'totalItemCount' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      },
    },  
    "totalExpectedQuantity" : { title: this.i18n.fanyi("receipt.totalExpectedQuantity"), index: 'totalExpectedQuantity' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.totalExpectedQuantity, b.totalExpectedQuantity),
      },
    },   
    "totalReceivedQuantity" : { title: this.i18n.fanyi("receipt.totalReceivedQuantity"), index: 'totalReceivedQuantity', width: 150 , 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.totalReceivedQuantity, b.totalReceivedQuantity),
      },
    },   
   
  };


 

  receiptTablePI = 10;
  receiptTablePS = -1;

  @ViewChild('receiptTable', { static: false })
  receiptTable!: STComponent;
 
  isSpinning = false;
  isReceivedInventorySpinning = false;
  validSuppliers: Supplier[] = [];

  receiptStatus = ReceiptStatus;

  
  private readonly fb = inject(FormBuilder);
  
  searchForm = this.fb.nonNullable.group({
    client: this.fb.control('', { nonNullable: true, validators: []}),
    number: this.fb.control('', { nonNullable: true, validators: []}),
    statusList: this.fb.control([], { nonNullable: true, validators: []}),
    supplier: this.fb.control('', { nonNullable: true, validators: []}),
    checkInDateTimeRanger: this.fb.control<Date | null>(null),
    checkInDate: this.fb.control<Date | null>(null),
  }); 
  
  billableActivityForm = this.fb.nonNullable.group({ 
    billableActivityType: this.fb.control<number | undefined>(undefined, { nonNullable: true, validators: [Validators.required]}),
    activityTime:  this.fb.control<Date | undefined>(undefined, { nonNullable: true, validators: [Validators.required]}),
    rate: this.fb.control<number | undefined>(undefined,{ nonNullable: true, validators:  []}),
    amount: this.fb.control<number | undefined>(undefined,{ nonNullable: true, validators:  []}),
    totalCharge: this.fb.control<number | undefined>(undefined, { nonNullable: true, validators: [Validators.required]}),
  });
   

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllReceipts: Receipt[] = []; 
  receiptStatusList = ReceiptStatus;
  receiptStatusListKeys = Object.keys(this.receiptStatusList);

  // the item package type that will be used to calculate the 
  // quanties for receipt line. 
  // 1. if there's one defined at the receipt line, then we will use it
  // 2. otherwise we will use the default item package type of the item
  receiptLineItemPackageTypes = new Map<number, ItemPackageType | undefined>();

  threePartyLogisticsFlag = false;
  loadingOrderDetailsRequest = 0;
  
  availableClients: Client[] = []; 

  
  listOfAllReceivedInventory: { [receiptNumber: string]: Inventory[] } = {};

  billableActivityReceipt?: Receipt;
  billableActivityReceiptLine?: ReceiptLine; 
  allBillableActivityTypes: BillableActivityType[] = [];
  availableBillableActivityTypes: BillableActivityType[] = [];

  billableActivityModal!: NzModalRef;  
  addActivityInProcess = false;

  addOrModifyReceiptLineModal!: NzModalRef;

  inventoryConfiguration?: InventoryConfiguration;
  currentProcessingReceiptLine!: ReceiptLine;
  displayOnly = false; 

  // initial the user permission map so that all the permission is disable
  // by default
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['modify-receipt', false],
    ['check-in-receipt', false],
    ['complete-receipt', false],
    ['add-receipt-billable-activity', false],
    ['remove-receipt-billable-activity', false],
    ['add-receipt-line-billable-activity', false],
    ['remove-receipt-line-billable-activity', false],
    ['remove-multiple-receipt', false],
    ['add-receipt', false],
    ['upload-receipt', false],
    ['upload-receiving-inventory', false],
    ['upload-putaway-inventory', false],
    ['modify-receipt', false],
  ]);

  constructor( 
    private modalService: NzModalService,
    private receiptService: ReceiptService,
    private receivingTransactionService: ReceivingTransactionService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private receiptLineService: ReceiptLineService,
    private titleService: TitleService,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
    private supplierService: SupplierService,
    private clientService: ClientService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private billableActivityTypeService: BillableActivityTypeService,
    private userService: UserService, 
    private datePipe: DatePipe,
    private dateTimeService: DateTimeService,
    private inventoryConfigurationService: InventoryConfigurationService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inbound/receipt").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                   
    userService.getUserPermissionByWebPage("/inbound/receipt").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    }); 
    
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        }  
        this.setupReceiptLineTableColumns();
        this.setupReceivedInventoryTableColumns();
        this.setupReceivingTransactionTableColumns();
      } , 
      error: () =>  { 
        this.setupReceiptLineTableColumns();
        this.setupReceivedInventoryTableColumns();
        this.setupReceivingTransactionTableColumns();
      }

    });
    
    this.initWebPageTableColumnConfiguration();
  }
  initWebPageTableColumnConfiguration() {
    this.initReceiptTableColumnConfiguration();
  }

  initReceiptTableColumnConfiguration() {
    
    this.localCacheService.getWebPageTableColumnConfiguration(this.pageName, "receiptTable")
    .subscribe({
      next: (webPageTableColumnConfigurationRes) => {
        
        if (webPageTableColumnConfigurationRes && webPageTableColumnConfigurationRes.length > 0){

          this.tableConfigurations["receiptTable"] = webPageTableColumnConfigurationRes;
          this.refreshReceiptTableColumns();

        }
        else {
          this.tableConfigurations["receiptTable"] = this.getDefaultReceiptTableColumnsConfiguration();
          this.refreshReceiptTableColumns();
        }
      }, 
      error: () => {
        
        this.tableConfigurations["receiptTable"] = this.getDefaultReceiptTableColumnsConfiguration();
        this.refreshReceiptTableColumns();
      }
    })
  }
  
  refreshReceiptTableColumns() {
    
    if (this.tableConfigurations["receiptTable"] == null) {
      return;
    } 
    this.receiptTableColumns = [
      { title: '', index: 'number', type: 'checkbox' },
    ];

    // loop through the table column configuration and add
    // the column if the display flag is checked, and by sequence
    let receiptTableConfiguration = this.tableConfigurations["receiptTable"].filter(
      column => column.displayFlag
    );

    receiptTableConfiguration.sort((a, b) => a.columnSequence - b.columnSequence);

    receiptTableConfiguration.forEach(
      columnConfig => {
        this.defaultReceiptTableColumns[columnConfig.columnName].title = columnConfig.columnDisplayText;

        this.receiptTableColumns = [...this.receiptTableColumns, 
          this.defaultReceiptTableColumns[columnConfig.columnName]
        ]
      }
    )

    this.receiptTableColumns = [...this.receiptTableColumns,  
      {
        title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
        render: 'actionColumn',
        iif: () => !this.displayOnly
      }, 
    ];
    
    if (this.receiptTable != null) {

      this.receiptTable.resetColumns({ emitReload: true });
    } 
  }

  
  getDefaultReceiptTableColumnsConfiguration(): WebPageTableColumnConfiguration[] {
    
    return [
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "number",
        columnDisplayText: this.i18n.fanyi("receipt.number"),
        columnWidth: 150,
        columnSequence: 1, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "client",
        columnDisplayText: this.i18n.fanyi("client"),
        columnWidth: 150,
        columnSequence: 2, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "supplier",
        columnDisplayText: this.i18n.fanyi("supplier"),
        columnWidth: 150,
        columnSequence: 3, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "status",
        columnDisplayText: this.i18n.fanyi("status"),
        columnWidth: 150,
        columnSequence: 4, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "totalLineCount",
        columnDisplayText: this.i18n.fanyi("receipt.totalLineCount"),
        columnWidth: 150,
        columnSequence: 5, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "totalItemCount",
        columnDisplayText: this.i18n.fanyi("receipt.totalItemCount"),
        columnWidth: 150,
        columnSequence: 6, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "totalExpectedQuantity",
        columnDisplayText: this.i18n.fanyi("receipt.totalExpectedQuantity"),
        columnWidth: 150,
        columnSequence: 7, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "receiptTable",
        columnName: "totalReceivedQuantity",
        columnDisplayText: this.i18n.fanyi("receipt.totalReceivedQuantity"),
        columnWidth: 150,
        columnSequence: 8, 
        displayFlag: true
      },
    ]
  } 

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inbound.receipt'));
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number']) {
        this.searchForm!.controls.number.setValue(params['number']);
        this.search();
      }
    });

    
    this.supplierService.loadSuppliers().subscribe(suppliers => (this.validSuppliers = suppliers));

    
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;

          // only initial the client list in a 3pl environment
          
          this.clientService.getClients().subscribe({
            next: (clientRes) => this.availableClients = clientRes
            
          });
        }
        else {
          this.threePartyLogisticsFlag = false;
        }  
      },  
    });

    this.billableActivityTypeService.loadBillableActivityTypes(true).subscribe({
      next: (billableActivityTypeRes) => this.allBillableActivityTypes = billableActivityTypeRes
    });
  }
  
  receiptTableColumnConfigurationChanged(tableColumnConfigurationList: WebPageTableColumnConfiguration[]){
    // console.log(`new wave table column configuration list ${tableColumnConfigurationList.length}`)
    // tableColumnConfigurationList.forEach(
    //   column => {
    //     console.log(`${JSON.stringify(column)}`)
    //   }
    // )
    this.tableConfigurations["receiptTable"] = tableColumnConfigurationList;
    this.refreshReceiptTableColumns();
}

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllReceipts = []; 

  }

  search(): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';

    
    let checkInStartTime : Date | undefined = this.searchForm.value.checkInDateTimeRanger ? 
        this.searchForm.value.checkInDateTimeRanger : undefined; 
    let checkInEndTime : Date | undefined= this.searchForm.value.checkInDateTimeRanger ? 
        this.searchForm.value.checkInDateTimeRanger : undefined; 
    let checkInSpecificDate : Date | undefined= this.searchForm.value.checkInDate ?
    this.searchForm.value.checkInDate : undefined;

    this.receiptService.getPageableReceipts(
      this.searchForm!.value.number ? this.searchForm!.value.number : undefined, 
      true,       
      this.searchForm!.value.statusList ? this.searchForm!.value.statusList.join(",") : undefined,       
      this.searchForm!.value.supplier ? this.searchForm!.value.supplier : undefined,
      checkInStartTime, 
      checkInEndTime, 
      checkInSpecificDate, 
         undefined,
         undefined,
      this.searchForm!.value.client ? this.searchForm!.value.client : undefined,
      this.receiptTable?.pi,
      this.receiptTable?.ps).subscribe({
        next: (page) => {

          this.searching = false;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: page.totalElements,
          });
          
          this.refreshDetailInformations(page.content);
          // sum up the line's billable activity and save it to the receipt level
          // for easy display
          this.setupReceiptBillableActivities(page.content);
          
          this.listOfAllReceipts = this.calculateQuantities(page.content); 
        }, 
        error: () => {

          this.searching = false;
          this.isSpinning = false;
          this.searchResult = '';
        }
      })  
  }
  setupReceiptBillableActivities(receipts: Receipt[]) {
    receipts.forEach(

      receipt => {
        receipt.receiptLineBillableActivities = [];
        receipt.receiptLines.forEach(
          receiptLine => {
            receipt.receiptLineBillableActivities = [
              ...receipt.receiptLineBillableActivities, 
              ...receiptLine.receiptLineBillableActivities!
            ]
          }
        )
      }
    );
  }
  receiptTableChanged(event: STChange) : void { 
    
    if (event.type === 'expand' && event.expand.expand === true) {
      // console.log(`expanded: ${event.expand.id}`)
      this.loadReceivedInventory(event.expand);
    }
    else if (event.type === 'pi' || event.type === 'ps') {
      // see if the PI or PS is changed. If so
      // we will need to redo the search since we use 
      // client size pagination
      const pipsChanged : boolean = 
          (this.receiptTablePI != this.receiptTable.pi) ||
          (this.receiptTablePS != this.receiptTable.ps);
 
      if (pipsChanged) {
        this.receiptTablePI = this.receiptTable.pi;
        this.receiptTablePS = this.receiptTable.ps;
        this.search();
      }

    }
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  // we will load the client / supplier / item information 
  // asyncronized
  async refreshDetailInformations(receipts: Receipt[]) { 
     
    let index = 0;
    this.loadingOrderDetailsRequest = 0;
    while (index < receipts.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 receipt at a time(each receipt may have 3 different request). 
      // we will get error if we flush requests for
      // too many receipts into the server at a time 
      
      
      while(this.loadingOrderDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshDetailInformation(receipts[index]);
      index++;
    } 

    receipts = [...receipts];
    
    // refresh the table while everything is loaded
    // console.log(`mnaually refresh the table`);   
    // this.st.reload();  
    this.receiptTable.reload();
  }
  refreshDetailInformation(receipt: Receipt) { 
  
      this.loadClient(receipt); 
     
      this.loadSupplier(receipt); 

      this.loadItems(receipt);

       
  }
  
  calculateDisplayQuanties(receipt: Receipt) : void { 
    receipt.receiptLines.forEach(
      receiptLine => {
          this.calculateReceiptLineDisplayQuantity(receiptLine);
      }
    )
  }
  
  calculateReceiptLineDisplayQuantity(receiptLine: ReceiptLine) : void { 
      // let's calculate the display quantities based on the item package type of priorities
      // 1. if there's one defined at the receipt line level
      // 2. default item package type of the item
      const itemPackagetType : ItemPackageType | undefined
          = (this.receiptLineItemPackageTypes.has(receiptLine.id!) && this.receiptLineItemPackageTypes.get(receiptLine.id!) != null) ?
              this.receiptLineItemPackageTypes.get(receiptLine.id!) : 
                (receiptLine.itemPackageType == null ? 
                      receiptLine.item?.defaultItemPackageType :
                      receiptLine.itemPackageType);
      //console.log(`item package type ${itemPackagetType?.name} will be used for line ${receiptLine.number}`);
      // see if we have the display UOM setup
      // if the display item unit of measure is setup for the item
      // then we will update the display quantity accordingly.
      // the same logic for both expected quantity and received quantity
      // 1. if the quantity can be divided by the display UOM's quantity, then display
      //    the quantity in display UOM and setup the display UOM for each quantity accordingly
      // 2. otherwise, setup teh quantity in stock UOM and use the stock UOM as the display quantity
      //    for each quantity
      if (itemPackagetType?.displayItemUnitOfMeasure) {
          //console.log(`display uom ${itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure?.name} is setup for item package type ${itemPackagetType.name}`)
          // console.log(`>> found displayItemUnitOfMeasure: ${receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure?.name}`)
          let displayItemUnitOfMeasureQuantity  = itemPackagetType?.displayItemUnitOfMeasure.quantity;
          //console.log(`> its quantity is ${displayItemUnitOfMeasureQuantity}`)
          
          // console.log(`>> with quantity ${displayItemUnitOfMeasureQuantity}`)
          //console.log(`receiptLine.expectedQuantity: ${receiptLine.expectedQuantity}, displayItemUnitOfMeasureQuantity: ${displayItemUnitOfMeasureQuantity}`)
            
          if (receiptLine.expectedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
            //console.log(`use the display item unit of measure ${itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure?.name} for display`)
            receiptLine.displayUnitOfMeasureForExpectedQuantity = itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure;
            receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity! / displayItemUnitOfMeasureQuantity!
          }
          else {
            // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
            // stock uom
            //console.log(`use the stock item unit of measure ${itemPackagetType?.stockItemUnitOfMeasure?.unitOfMeasure?.name} for display`)
            
            receiptLine.displayExpectedQuantity! = receiptLine.expectedQuantity!;
            // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
            receiptLine.displayUnitOfMeasureForExpectedQuantity = itemPackagetType?.stockItemUnitOfMeasure?.unitOfMeasure;
          }
          
          if (receiptLine.arrivedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
            receiptLine.displayUnitOfMeasureForArrivedQuantity = itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure;
            receiptLine.displayArrivedQuantity = receiptLine.arrivedQuantity! / displayItemUnitOfMeasureQuantity!
          }
          else {
            receiptLine.displayArrivedQuantity! = receiptLine.arrivedQuantity!;
            // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
            receiptLine.displayUnitOfMeasureForArrivedQuantity = itemPackagetType?.stockItemUnitOfMeasure?.unitOfMeasure;
          }
            
          if (receiptLine.receivedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
            receiptLine.displayReceivedQuantity = receiptLine.receivedQuantity! / displayItemUnitOfMeasureQuantity!
            receiptLine.displayUnitOfMeasureForReceivedQuantity = itemPackagetType?.displayItemUnitOfMeasure.unitOfMeasure;
          }
          else {
            // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
            // stock uom
            receiptLine.displayReceivedQuantity! = receiptLine.receivedQuantity!;
            // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
            receiptLine.displayUnitOfMeasureForReceivedQuantity = itemPackagetType?.stockItemUnitOfMeasure?.unitOfMeasure;
          }
        }
        else {
          // there's no display UOM setup for this inventory, we will display
          // by the quantity
            receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity!;
            receiptLine.displayArrivedQuantity! = receiptLine.arrivedQuantity!;
            receiptLine.displayReceivedQuantity! = receiptLine.receivedQuantity!;
        }  
  }
  
  
  loadClient(receipt: Receipt) {
     
    if (receipt.clientId && receipt.client == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getClient(receipt.clientId).subscribe(
        {
          next: (clientRes) => {
            receipt.client = clientRes;
            
            this.loadingOrderDetailsRequest--;
          }
        }
      );
      
    }
  }
  
  loadSupplier(receipt: Receipt) { 
    if (receipt.supplierId && receipt.supplier == null) {
      this.loadingOrderDetailsRequest++;
      
      this.localCacheService.getSupplier(receipt.supplierId).subscribe(
        {
          next: (supplierRes) => {
            receipt.supplier = supplierRes;
            this.loadingOrderDetailsRequest--;
          }
        }
      );
    }
  }

  
  loadItems(receipt: Receipt) {
     receipt.receiptLines.forEach(
       receiptLine => this.loadItem(receiptLine)
     );
  }

  loadItem(receiptLine: ReceiptLine) { 
    if (receiptLine.itemId && receiptLine.item == null) { 
      this.loadingOrderDetailsRequest++;
       
      this.localCacheService.getItem(receiptLine.itemId).subscribe(
        {
          next: (itemRes) => { 
            receiptLine.item = itemRes; 

            this.loadItemPackageType(receiptLine);
            this.calculateReceiptLineDisplayQuantity(receiptLine);
            this.loadingOrderDetailsRequest--;
          }
        }
      );
    }
    else if (receiptLine.item != null) {
      // console.log(`item is not null:\n${JSON.stringify(receiptLine.item)}`)
      this.loadItemPackageType(receiptLine);
      this.calculateReceiptLineDisplayQuantity(receiptLine);
    }
  }

  // setup the item package type
  loadItemPackageType(receiptLine: ReceiptLine) {

    if (receiptLine.itemPackageTypeId != null && receiptLine.itemPackageType == null) {
        receiptLine.itemPackageType = receiptLine.item?.itemPackageTypes.find(
          itempackageType => itempackageType.id == receiptLine.itemPackageTypeId
        );
    }

    // we will save the item package type for the receipt line so that we can calculate and display the
    // quantity based on the right item package type
    // 1. if there's a item package type defined at the receipt line, then we will use it
    // 2. otherwise we will use the default item package type
    this.receiptLineItemPackageTypes.set(receiptLine.id!, 
      receiptLine.itemPackageType == null ? receiptLine.item?.defaultItemPackageType : receiptLine.itemPackageType);
  }

  calculateQuantities(receipts: Receipt[]): Receipt[] {
    receipts.forEach(receipt => {
      const existingItemIds = new Set();
      receipt.totalExpectedQuantity = 0;
      receipt.totalReceivedQuantity = 0;
      receipt.totalLineCount = receipt.receiptLines.length;

      receipt.receiptLines.forEach(receiptLine => {
        receipt.totalExpectedQuantity! += receiptLine.expectedQuantity!;
        receipt.totalReceivedQuantity! += receiptLine.receivedQuantity!;
        if (!existingItemIds.has(receiptLine.itemId)) {
          existingItemIds.add(receiptLine.itemId);
        }
      });
      receipt.totalItemCount = existingItemIds.size;
    });
    return receipts;
  }
 
  removeSelectedReceipts(): void {
    // make sure we have at least one checkbox checked
    const selectedReceipts = this.getSelectedReceipts();
    if (selectedReceipts.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.receiptService.removeReceipts(selectedReceipts).subscribe(res => {
            console.log('selected receipt removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedReceipts(): Receipt[] {
    let selectedReceipts: Receipt[] = []; 
    
    const dataList: STData[] = this.receiptTable.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedReceipts = [...selectedReceipts,
              ...this.listOfAllReceipts.filter(
                receipt => receipt.id == data["id"]
              )
          ]

        }
      ); 
      return selectedReceipts;
 
  }

  checkInReceipt(receipt: Receipt): void {
    this.isSpinning = true;
    this.receiptService.checkInReceipt(receipt).subscribe({
      next: () => {
        this.isSpinning = false;

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }

  closeReceipt(receipt: Receipt): void {
    this.isSpinning = true;
    this.receiptService.closeReceipt(receipt).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }
   
  @ViewChild('st', { static: false })
  st!: STComponent;
  
  
  receiptLineTableColumns: STColumn[] = [];
  setupReceiptLineTableColumns() {

    this.receiptLineTableColumns = [ 
      { title: this.i18n.fanyi("receipt.line.number"), index: 'number', width: 150 },    
      {
        title: this.i18n.fanyi("item"), width: 150, 
        render: 'itemNameColumn', 
      },
      {
        title: this.i18n.fanyi("item.description"), width: 150, 
        render: 'itemDescriptionColumn', 
      }, 
      {
        title: this.i18n.fanyi("item.package-type"), width: 150, index: 'itemPackageType.name'  
      }, 
      { title: this.i18n.fanyi("receipt.line.expectedQuantity"), 
      
          render: 'expectedQuantityColumn',  width: 150 },     
      { title: this.i18n.fanyi("receipt.line.arrivedQuantity"), 
      
          render: 'arrivedQuantityColumn',  width: 150 },     
      { title: this.i18n.fanyi("cubicMeter"), 
          render: 'cubicMeterColumn', width: 150 },  
      { title: this.i18n.fanyi("receipt.line.receivedQuantity"),  render: 'receivedQuantityColumn',  width: 150 },    
      { title: this.i18n.fanyi("receipt.line.overReceivingQuantity"), index: 'overReceivingQuantity' , width: 150 },  
      { title: this.i18n.fanyi("receipt.line.overReceivingPercent"), index: 'overReceivingPercent' , width: 150 },      
      { title: this.i18n.fanyi("qcQuantity"), index: 'qcQuantity' , width: 150 },      
      { title: this.i18n.fanyi("qcPercentage"), index: 'qcPercentage' , width: 150 },      
      { title: this.i18n.fanyi("qcQuantityRequested"), index: 'qcQuantityRequested' , width: 150 },     
      { title: this.i18n.fanyi("color"), index: 'color', width: 150 },  
        { title: this.i18n.fanyi("productSize"), index: 'productSize', width: 150 },  
        { title: this.i18n.fanyi("style"), index: 'style', width: 150 }, 
        { title: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,  
              index: 'inventoryAttribute1' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute1Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,  
              index: 'inventoryAttribute2' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute2Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,  
              index: 'inventoryAttribute3' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute3Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,  
              index: 'inventoryAttribute4' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute4Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,  
              index: 'inventoryAttribute5' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute5Enabled == true, width: 150  
        }, 
      {
        title: this.i18n.fanyi("action"), 
        render: 'actionColumn', 
        width: 250,
        fixed: 'right',
        iif: () => !this.displayOnly
  
      },   
    
    ];
  }
 
  changeDisplayItemUnitOfMeasureForExpectedQuantity(receiptLine: ReceiptLine, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (receiptLine.expectedQuantity! % itemUnitOfMeasure.quantity! == 0) {

      receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity! / itemUnitOfMeasure.quantity!;
      receiptLine.displayUnitOfMeasureForExpectedQuantity = itemUnitOfMeasure.unitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the line's expected quantity ${ 
        receiptLine.expectedQuantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }
  
  changeDisplayItemUnitOfMeasureForArrivedQuantity(receiptLine: ReceiptLine, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (receiptLine.arrivedQuantity! % itemUnitOfMeasure.quantity! == 0) {

      receiptLine.displayArrivedQuantity = receiptLine.arrivedQuantity! / itemUnitOfMeasure.quantity!;
      receiptLine.displayUnitOfMeasureForArrivedQuantity = itemUnitOfMeasure.unitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the line's arrived quantity ${ 
        receiptLine.arrivedQuantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }
 
  changeDisplayItemUnitOfMeasureForReceivedQuantity(receiptLine: ReceiptLine, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (receiptLine.receivedQuantity! % itemUnitOfMeasure.quantity! == 0) {

      receiptLine.displayReceivedQuantity = receiptLine.receivedQuantity! / itemUnitOfMeasure.quantity!;
      receiptLine.displayUnitOfMeasureForReceivedQuantity = itemUnitOfMeasure.unitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the line's received quantity ${ 
        receiptLine.displayReceivedQuantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }

  @ViewChild('stInventory', { static: false })
  stInventory!: STComponent;
  receivedInventoryTableColumns: STColumn[] = [];

  setupReceivedInventoryTableColumns() {
    this.receivedInventoryTableColumns  = [ 
      { title: this.i18n.fanyi("lpn"), index: 'lpn', width: 150 },    
      {
        title: this.i18n.fanyi("item"), index: 'item.name' ,  width: 150,
      },
      {
        title: this.i18n.fanyi("item.description"),  index: 'item.description' ,  width: 150,
      }, 
      {
        title: this.i18n.fanyi("item.package-type"),  index: 'itemPackageType.name' ,  width: 150,
      }, 
      { title: this.i18n.fanyi("quantity"), 
      
          render: 'quantityColumn',  width: 150 },     
      { title: this.i18n.fanyi("inventory.status"),  index: 'inventoryStatus.name' ,  width: 150 },   
      { title: this.i18n.fanyi("color"), index: 'color' , width: 150 },       
      { title: this.i18n.fanyi("productSize"), index: 'productSize' , width: 150 },       
      { title: this.i18n.fanyi("style"), index: 'style' , width: 150 },        
      { title: this.i18n.fanyi("location"), index: 'location.name' , width: 150 },  
      { title: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,  
        index: 'attribute1' ,
          iif: () =>  this.inventoryConfiguration?.inventoryAttribute1Enabled == true, width: 150 }, 
      { title: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,    
              index: 'attribute2' ,
          iif: () =>   this.inventoryConfiguration?.inventoryAttribute2Enabled == true,width: 150  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,    
          index: 'attribute3' ,
          iif: () =>   this.inventoryConfiguration?.inventoryAttribute3Enabled == true, width: 150 }, 
      { title: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,  
          index: 'attribute4' ,
          iif: () =>  this.inventoryConfiguration?.inventoryAttribute4Enabled == true, width: 150 },
      { title: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,  
              index: 'attribute5' ,
          iif: () =>   this.inventoryConfiguration?.inventoryAttribute5Enabled == true, width: 150 },

      { title: this.i18n.fanyi("nextLocation"), 
      render: 'nextLocationColumn',  width: 150 },       
      // { title: this.i18n.fanyi("action"), render: 'actionColumn', width: 150 },       
    ];
     
  }
  
  @ViewChild('receivingTransactionTable', { static: false })
  receivingTransactionTable!: STComponent;
  receivingTransactionTableColumns: STColumn[] = [];
  setupReceivingTransactionTableColumns() {
    this.receivingTransactionTableColumns  = [ 
      { title: this.i18n.fanyi("lpn"), index: 'lpn', width: 150 },    
      {
        title: this.i18n.fanyi("item"), index: 'item.name' ,  width: 150,
      },
      {
        title: this.i18n.fanyi("item.description"),  index: 'item.description' ,  width: 150,
      }, 
      {
        title: this.i18n.fanyi("item.package-type"),  index: 'itemPackageType.name' ,  width: 150,
      }, 
      { title: this.i18n.fanyi("quantity"), 
      
      index: 'quantity',  width: 150 },     
      { title: this.i18n.fanyi("inventory.status"),  index: 'inventoryStatus.name' ,  width: 150 },   
      { title: this.i18n.fanyi("color"), index: 'color' , width: 150 },       
      { title: this.i18n.fanyi("productSize"), index: 'productSize' , width: 150 },       
      { title: this.i18n.fanyi("style"), index: 'style' , width: 150 },         
      { title: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,  
        index: 'attribute1' ,
          iif: () =>  this.inventoryConfiguration?.inventoryAttribute1Enabled == true, width: 150 }, 
      { title: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,    
              index: 'attribute2' ,
          iif: () =>   this.inventoryConfiguration?.inventoryAttribute2Enabled == true,width: 150  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,    
          index: 'attribute3' ,
          iif: () =>   this.inventoryConfiguration?.inventoryAttribute3Enabled == true, width: 150 }, 
      { title: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,  
          index: 'attribute4' ,
          iif: () =>  this.inventoryConfiguration?.inventoryAttribute4Enabled == true, width: 150 },
      { title: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,  
              index: 'attribute5' ,
          iif: () =>   this.inventoryConfiguration?.inventoryAttribute5Enabled == true, width: 150 },
 
    ];
     
  }

  loadReceivingTransactions(receipt: Receipt) {
    receipt.receivingTransactions = [];
    this.receivingTransactionService.getReceivingTransactions(receipt.id!).subscribe({
      next: (receivingTransactionRes) => {
        receipt.receivingTransactions = receivingTransactionRes;
        this.receivingTransactionTable.reload();
      }, 
    }); 

  }

  loadReceiptDetails(receipt: Receipt) {
    
    this.loadReceiptLine(receipt);
    this.loadReceivedInventory(receipt);
  }

  loadReceiptLine(receipt: Receipt) {
    this.loadItemInformation(receipt.receiptLines);

  }
  loadItemInformation(receiptLines: ReceiptLine[]) {

    // ok, we will group the items all together then 
    // load the item in one transaction
    // to increase performance      
    let itemIdSet = new Set<number>(); 
    receiptLines.forEach(
      receiptLine => {
        itemIdSet.add(receiptLine.itemId!);
      }
    )
    if (itemIdSet.size > 0) {

      let itemMap = new Map<number, Item>(); 
      let itemIdList : string = Array.from(itemIdSet).join(',')
      this.itemService.getItemsByIdList(itemIdList, false).subscribe({
        next: (itemRes) => {

          // add the result to a map so we can assign it to 
          // the work order / work order line later on
          itemRes.forEach(
            item =>  itemMap.set(item.id!, item)
          );

          this.setupReceiptLineItems(receiptLines, itemMap);
          this.loadDefaultStockUoms(receiptLines);
          
        }
      })
    }
  }
  loadDefaultStockUoms(receiptLines: ReceiptLine[]) { 
    let unitOfMeasureIdSet = new Set<number>(); 
    let itemsMap = new Map<number, Set<Item>>()

    // get all the unit of measure id we will need to load
    receiptLines.forEach(
      receiptLine => { 
        
        if (receiptLine.item?.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasureId != null &&
          receiptLine.item?.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure == null ) {
            let unitOfMeasureId = receiptLine.item?.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasureId;
            unitOfMeasureIdSet.add(unitOfMeasureId);
            let items : Set<Item> = itemsMap.get(unitOfMeasureId) == null ? new Set() : itemsMap.get(unitOfMeasureId)!
            items?.add(receiptLine.item);
            itemsMap.set(unitOfMeasureId, items);
        }
        
      }
    );

    // console.log(`we got ${unitOfMeasureIdSet.size} unit of measure to load`);

    unitOfMeasureIdSet.forEach(
      unitOfMeasureId => {

        this.localCacheService.getUnitOfMeasure(unitOfMeasureId)
            .subscribe({
              next: (unitOfMeasureRes) => { 
                itemsMap.get(unitOfMeasureId)?.forEach(
                  item => item.defaultItemPackageType!.stockItemUnitOfMeasure!.unitOfMeasure = unitOfMeasureRes
                );  
                // this.listOfAllWorkOrder = workOrders;
              }
            });
      }
    )

  }
  
  setupReceiptLineItems(receiptLines: ReceiptLine[], itemMap : Map<number, Item>) {
    receiptLines.forEach(
      receiptLine => {
        
        if (itemMap.has(receiptLine.itemId!)) {
          receiptLine.item = itemMap.get(receiptLine.itemId!)
          
          
        }
        
      }
    );
  }

  loadReceivedInventory(receipt: Receipt) {
    this.listOfAllReceivedInventory[receipt.number] = [];
    this.isReceivedInventorySpinning = true;
    this.receiptService.getReceivedInventory(receipt).subscribe({
      next: (inventories) => {
        this.listOfAllReceivedInventory[receipt.number] = inventories; 
        this.listOfAllReceivedInventory[receipt.number].forEach(
          inventory => this.calculateInventoryDisplayQuantity(inventory)
        )
        this.isReceivedInventorySpinning = false;
      }, 
    }); 

  }
  
  changeDisplayItemUnitOfMeasure(inventory: Inventory, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (inventory.quantity! % itemUnitOfMeasure.quantity! == 0) {

      inventory.displayQuantity = inventory.quantity! / itemUnitOfMeasure.quantity!;
      inventory.itemPackageType!.displayItemUnitOfMeasure = itemUnitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the inventory's quantity ${ 
          inventory.quantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }
  
  calculateInventoryDisplayQuantity(inventory: Inventory) : void {
    // see if we have the display UOM setup
    if (inventory.itemPackageType?.displayItemUnitOfMeasure) {
      let displayItemUnitOfMeasureQuantity  = inventory.itemPackageType.displayItemUnitOfMeasure.quantity;

      if (inventory.quantity! % displayItemUnitOfMeasureQuantity! ==0) {
        inventory.displayQuantity = inventory.quantity! / displayItemUnitOfMeasureQuantity!
      }
      else {
        // the inventory's quantity can't be devided by the display uom, we will display the quantity in 
        // stock uom
        inventory.displayQuantity = inventory.quantity;
        inventory.itemPackageType.displayItemUnitOfMeasure = inventory.itemPackageType.stockItemUnitOfMeasure;
      }
    }
    else {
      // there's no display UOM setup for this inventory, we will display
      // by the quantity
      inventory.displayQuantity = inventory.quantity; 
    }
  }

  @ViewChild('stReceiptBillableActivityTable', { static: false })
  stReceiptBillableActivityTable!: STComponent;
  receiptBillableActivityTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("billable-activity-type"), index: 'billableActivityType.description', width: 150 },    
    {
      title: this.i18n.fanyi("rate"), index: 'rate' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("amount"), index: 'amount' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("totalCharge"), index: 'totalCharge' ,  width: 150,
    }, 
    { title: this.i18n.fanyi("activityTime"), render: 'activityTimeColumn', width: 150 }, 
    { title: this.i18n.fanyi("action"), render: 'actionColumn', width: 150 ,
      iif: () => !this.displayOnly},       
  ];

  @ViewChild('stReceiptLineBillableActivityTable', { static: false })
  stReceiptLineBillableActivityTable!: STComponent;
  receiptLineBillableActivityTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("billable-activity-type"), index: 'billableActivityType.description', width: 150 },    
    {
      title: this.i18n.fanyi("rate"), index: 'rate' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("amount"), index: 'amount' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("totalCharge"), index: 'totalCharge' ,  width: 150,
    }, 
    { title: this.i18n.fanyi("activityTime"), render: 'activityTimeColumn', width: 150 },    
    { title: this.i18n.fanyi("action"), render: 'actionColumn', width: 150 , 
    iif: () => !this.displayOnly},       
  ];

  removeReceiptBillableActivity(receipt: Receipt, 
    receiptBillableActivity: ReceiptBillableActivity) {

    this.receiptService.removeReceiptBillableActivity(
      receipt.id!, receiptBillableActivity.id!
    ).subscribe({
      next: () => {

        receipt.receiptBillableActivities = receipt.receiptBillableActivities.filter(
          existingReceiptBillableActivity => existingReceiptBillableActivity.id != receiptBillableActivity.id
        );
      }
    })
  }

  removeReceiptLineBillableActivity(receiptLine: ReceiptLine, 
    receiptLineBillableActivity: ReceiptLineBillableActivity) {

      this.isSpinning = true;
      //console.log(`start to remove receipt line billable activity`);

      this.receiptService.removeReceiptLineBillableActivity(
        receiptLine.id!, receiptLineBillableActivity.id!
      ).subscribe({
        next: () => {
          
          this.isSpinning = false;
          
          receiptLine.receiptLineBillableActivities = receiptLine.receiptLineBillableActivities.filter(
            existingReceiptLineBillableActivity => existingReceiptLineBillableActivity.id != receiptLineBillableActivity.id
          );
          
        }
      })
  }
 
  
  openAddReceiptActivityModal(
    receipt: Receipt,
    tplBillableActivityModalTitle: TemplateRef<{}>,
    tplBillableActivityModalContent: TemplateRef<{}>,
    tplBillableActivityModalFooter: TemplateRef<{}>,
  ): void {

    this.openAddActivityModal(
      receipt, 
      undefined, 
      tplBillableActivityModalTitle,
      tplBillableActivityModalContent,
      tplBillableActivityModalFooter,

    )
  }
  
  openAddReceiptLineActivityModal(
    receipt: Receipt,
    receiptLine: ReceiptLine,
    tplBillableActivityModalTitle: TemplateRef<{}>,
    tplBillableActivityModalContent: TemplateRef<{}>,
    tplBillableActivityModalFooter: TemplateRef<{}>,
  ): void {
    this.openAddActivityModal(
      receipt, 
      receiptLine, 
      tplBillableActivityModalTitle,
      tplBillableActivityModalContent,
      tplBillableActivityModalFooter,

    )
  }

  openAddActivityModal(
    receipt: Receipt,
    receiptLine: ReceiptLine | undefined,
    tplBillableActivityModalTitle: TemplateRef<{}>,
    tplBillableActivityModalContent: TemplateRef<{}>,
    tplBillableActivityModalFooter: TemplateRef<{}>,
  ): void {
    // make sure the item is ready for receiving  
    this.billableActivityReceipt = receipt;
    this.billableActivityReceiptLine = receiptLine;


    this.availableBillableActivityTypes = this.allBillableActivityTypes;
 /**
  * 
  * 
    if (receiptLine) {

      this.availableBillableActivityTypes =
        this.allBillableActivityTypes.filter(
          billableActivityType =>  
             !receiptLine.receiptLineBillableActivities.some(
                receiptLineBillableActivity => 
                    receiptLineBillableActivity.billableActivityTypeId == billableActivityType.id
            ));
    }
    else {

      this.availableBillableActivityTypes =
        this.allBillableActivityTypes.filter(
          billableActivityType =>  
            !receipt.receiptBillableActivities.some(
                receiptBillableActivity => 
                    receiptBillableActivity.billableActivityTypeId == billableActivityType.id
            ));
    }
  * 
  */



    // show the model
    this.billableActivityModal = this.modalService.create({
      nzTitle: tplBillableActivityModalTitle,
      nzContent: tplBillableActivityModalContent,
      nzFooter: tplBillableActivityModalFooter,
      nzWidth: 1000,
    });
    
  }
  closeBillableActivityModal(): void {
    this.billableActivityModal.destroy(); 
  }
  confirmBillableActivity(): void {  
    
    this.addActivityInProcess = true;
    if (this.billableActivityForm.valid) {
      
      if (this.billableActivityReceiptLine) {

        const receiptLineBillableActivity : ReceiptLineBillableActivity = {        
          billableActivityTypeId: this.billableActivityForm.value.billableActivityType ? this.billableActivityForm.value.billableActivityType : undefined,
          activityTime: this.billableActivityForm.value.activityTime ? this.billableActivityForm.value.activityTime : undefined,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          clientId:  this.billableActivityReceipt?.clientId,
          rate: this.billableActivityForm.value.rate ? this.billableActivityForm.value.rate : undefined,
          amount: this.billableActivityForm.value.amount ? this.billableActivityForm.value.amount : undefined,
          totalCharge: this.billableActivityForm.value.totalCharge ? this.billableActivityForm.value.totalCharge : undefined,
        }
        this.receiptService.addReceiptLineBillableActivity(this.billableActivityReceiptLine.id!, 
          receiptLineBillableActivity).subscribe({
          next: () => {
            
            this.addActivityInProcess = false;
            this.billableActivityModal.destroy();
            
            this.searchForm!.controls.number.setValue(this.billableActivityReceipt!.number);
            this.search();
          },
          error: () => this.addActivityInProcess = false
        });
      }
      else {

        const receiptBillableActivity : ReceiptBillableActivity = {        
          billableActivityTypeId: this.billableActivityForm.value.billableActivityType ? this.billableActivityForm.value.billableActivityType : undefined,
          activityTime: this.billableActivityForm.value.activityTime ? this.billableActivityForm.value.activityTime : undefined,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          clientId:  this.billableActivityReceipt?.clientId,
          rate: this.billableActivityForm.value.rate ? this.billableActivityForm.value.rate : undefined,
          amount: this.billableActivityForm.value.amount ? this.billableActivityForm.value.amount : undefined,
          totalCharge: this.billableActivityForm.value.totalCharge ? this.billableActivityForm.value.totalCharge : undefined,
        }
        this.receiptService.addReceiptBillableActivity(
          this.billableActivityReceipt!.id!, receiptBillableActivity).subscribe({
          next: () => {
            this.addActivityInProcess = false;
            this.billableActivityModal.destroy();
            
            this.searchForm!.controls.number.setValue(this.billableActivityReceipt!.number);
            this.search();
          }, 
          error: () => this.addActivityInProcess = false
        });
      } 
    } else {
      this.displayBillableActivityFormError(this.billableActivityForm);
      this.addActivityInProcess = false; 
    }
  }
  displayBillableActivityFormError(fromGroup: UntypedFormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
  
  recalculateTotalCharge(): void { 
    
    if (this.billableActivityForm.value.rate != null &&
      this.billableActivityForm.value.amount != null) {

        this.billableActivityForm!.controls.totalCharge.setValue(
          this.billableActivityForm.value.rate * 
          this.billableActivityForm.value.amount
        );
        
      } 
  }

  
  @ViewChild('stLineBillableActivityTable', { static: false })
  stLineBillableActivityTable!: STComponent;
  stLineBillableActivityTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("billable-activity-type"), index: 'billableActivityType.description', width: 150 },    
    {
      title: this.i18n.fanyi("rate"), index: 'rate' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("amount"), index: 'amount' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("totalCharge"), index: 'totalCharge' ,  width: 150,
    }, 
    { title: this.i18n.fanyi("action"), render: 'actionColumn', width: 150, 
    iif: () => !this.displayOnly },       
  ]; 

 exportReceipts() {  
       
   var columnNames = this.getReceiptExportExcelColumns();
   var contents = this.getReceiptExportExcelRows(this.listOfAllReceipts);


   var worksheet = XLSX.utils.aoa_to_sheet([
     columnNames, 
     ...contents
   ]); 
    

   /* generate workbook and add the worksheet */
   const workbook: XLSX.WorkBook = XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(workbook, worksheet, 'receipt');

   /* save to file */
   XLSX.writeFile(workbook,`receipt.xlsx`);
 }
 
 getReceiptExportExcelColumns() : string[]   {

    let columnNames : string[] = [];
  
    // receipt information
    columnNames = [...columnNames, this.i18n.fanyi("receipt.number")]; 
    columnNames = [...columnNames, this.i18n.fanyi("client")]; 
    columnNames = [...columnNames, this.i18n.fanyi("supplier")]; 
    columnNames = [...columnNames, this.i18n.fanyi("status")]; 
    columnNames = [...columnNames, this.i18n.fanyi("check-in-date")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.totalLineCount")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.totalItemCount")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.totalExpectedQuantity")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.totalReceivedQuantity")]; 
  
    // receipt line information

    columnNames = [...columnNames, this.i18n.fanyi("receipt.line.number")]; 
    columnNames = [...columnNames, this.i18n.fanyi("item")]; 
    columnNames = [...columnNames, this.i18n.fanyi("item.description")]; 
    columnNames = [...columnNames, this.i18n.fanyi("item.package-type")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.line.expectedQuantity")]; 
    columnNames = [...columnNames, this.i18n.fanyi("unitOfMeasure")]; 
    columnNames = [...columnNames, this.i18n.fanyi("cubicMeter")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.line.receivedQuantity")]; 
    columnNames = [...columnNames, this.i18n.fanyi("unitOfMeasure")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.line.overReceivingQuantity")]; 
    columnNames = [...columnNames, this.i18n.fanyi("receipt.line.overReceivingPercent")];  
    columnNames = [...columnNames, this.i18n.fanyi("qcQuantity")]; 
    columnNames = [...columnNames, this.i18n.fanyi("qcPercentage")]; 
    columnNames = [...columnNames, this.i18n.fanyi("qcQuantityRequested")]; 
    columnNames = [...columnNames, this.i18n.fanyi("color")]; 
    columnNames = [...columnNames, this.i18n.fanyi("productSize")]; 
    columnNames = [...columnNames, this.i18n.fanyi("style")]; 
    
    if (this.inventoryConfiguration?.inventoryAttribute1Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName];
    }
    if (this.inventoryConfiguration?.inventoryAttribute2Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName];
    }
    if (this.inventoryConfiguration?.inventoryAttribute3Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName];
    }
    if (this.inventoryConfiguration?.inventoryAttribute4Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName];
    }
    if (this.inventoryConfiguration?.inventoryAttribute5Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName];
    }

    return columnNames;
  }

  
  getReceiptExportExcelRows(receiptList: Receipt[]) : string[][]   {
    let rows: string[][] = [];

    receiptList.forEach(
      receipt => rows = [...rows, ...this.getReceiptLineExportExcelRows(receipt)]
    )
    return rows;
  }
  
  getReceiptLineExportExcelRows(receipt: Receipt) : string[][]   {
    // one row per receipt line
    let rows : string[][] = [];
    
    let receiptInfo  : string[] = [];
    // receipt information
    receiptInfo = [...receiptInfo, receipt.number]; 
    receiptInfo = [...receiptInfo, receipt.client == null ? "" : receipt.client.name]; 
    receiptInfo = [...receiptInfo, receipt.supplier == null ? "" : receipt.supplier.name];  
    receiptInfo = [...receiptInfo, this.i18n.fanyi('RECEIPT-STATUS-' + receipt.receiptStatus)];   
    receiptInfo = [...receiptInfo, receipt.checkInTime == null ? "" : 
        this.dateTimeService.convertTimeToWarehouseTimeZone(receipt.checkInTime).format('YYYY-MM-DD HH:mm:ss')];  
    receiptInfo = [...receiptInfo, receipt.totalLineCount == null ? "" : receipt.totalLineCount.toString()];  
    receiptInfo = [...receiptInfo, receipt.totalItemCount == null ? "" : receipt.totalItemCount.toString()];  
    receiptInfo = [...receiptInfo, receipt.totalExpectedQuantity == null ? "" : receipt.totalExpectedQuantity.toString()];  
    receiptInfo = [...receiptInfo, receipt.totalReceivedQuantity == null ? "" : receipt.totalReceivedQuantity.toString()];  
    // if there's no receipt line for the receipt, we will still export an excel row
    // with empty line information
    if (receipt.receiptLines == null || receipt.receiptLines.length == 0) {
      let emptyLineRow = [...receiptInfo, 
        "", "", "", "", "",
        "", "", "", "", "", 
        "", "", 
        "", "", "", "", ""];
        if (this.inventoryConfiguration?.inventoryAttribute1Enabled == true) {
          emptyLineRow = [...emptyLineRow,  ""];
        }
        if (this.inventoryConfiguration?.inventoryAttribute2Enabled == true) {
          emptyLineRow = [...emptyLineRow,  ""];
        }
        if (this.inventoryConfiguration?.inventoryAttribute3Enabled == true) {
          emptyLineRow = [...emptyLineRow,  ""];
        }
        if (this.inventoryConfiguration?.inventoryAttribute4Enabled == true) {
          emptyLineRow = [...emptyLineRow,  ""];
        }
        if (this.inventoryConfiguration?.inventoryAttribute5Enabled == true) {
          emptyLineRow = [...emptyLineRow,  ""];
        }
        return [emptyLineRow];
    }

    // one excel row per receipt line
  
    // receipt line information
    receipt.receiptLines.forEach(
      receiptLine => {
        let receiptLineRow = [...receiptInfo]; 
        receiptLineRow = [...receiptLineRow, receiptLine.number == null ? "" : receiptLine.number]; 
        receiptLineRow = [...receiptLineRow, receiptLine.item == null ? "" : receiptLine.item.name]; 
        receiptLineRow = [...receiptLineRow, receiptLine.item == null ? "" : receiptLine.item.description]; 
        receiptLineRow = [...receiptLineRow, receiptLine.itemPackageType == null ? "" : receiptLine.itemPackageType.name!]; 

        receiptLineRow = [...receiptLineRow, receiptLine.displayExpectedQuantity == null ? "" : 
            `${receiptLine.displayExpectedQuantity}`];            
        receiptLineRow = [...receiptLineRow, receiptLine.displayUnitOfMeasureForExpectedQuantity == null ? "" : 
                   receiptLine.displayUnitOfMeasureForExpectedQuantity.name]; 
        receiptLineRow = [...receiptLineRow, receiptLine.cubicMeter == null ? "" : receiptLine.cubicMeter.toString()]; 
        receiptLineRow = [...receiptLineRow, receiptLine.receivedQuantity == null ? "" : 
            `${receiptLine.displayReceivedQuantity}`]; 
            
        receiptLineRow = [...receiptLineRow, receiptLine.displayUnitOfMeasureForReceivedQuantity == null ? "" : 
            receiptLine.displayUnitOfMeasureForReceivedQuantity.name]; 

        receiptLineRow = [...receiptLineRow, receiptLine.overReceivingQuantity == null ? "" : receiptLine.overReceivingQuantity.toString()];
        receiptLineRow = [...receiptLineRow, receiptLine.overReceivingPercent == null ? "" : receiptLine.overReceivingPercent.toString()]; 
        receiptLineRow = [...receiptLineRow, receiptLine.qcQuantity == null ? "" : receiptLine.qcQuantity.toString()]; 
        receiptLineRow = [...receiptLineRow, receiptLine.qcPercentage == null ? "" : receiptLine.qcPercentage.toString()]; 
        receiptLineRow = [...receiptLineRow, receiptLine.qcQuantityRequested == null ? "" : receiptLine.qcQuantityRequested.toString()]; 
        receiptLineRow = [...receiptLineRow, receiptLine.color == null ? "" : receiptLine.color];  
        receiptLineRow = [...receiptLineRow, receiptLine.productSize == null ? "" : receiptLine.productSize];  
        receiptLineRow = [...receiptLineRow, receiptLine.style == null ? "" : receiptLine.style];   
        if (this.inventoryConfiguration?.inventoryAttribute1Enabled == true) {
          receiptLineRow = [...receiptLineRow, receiptLine.inventoryAttribute1 == null ? "" : receiptLine.inventoryAttribute1];
        }
        if (this.inventoryConfiguration?.inventoryAttribute2Enabled == true) {
          receiptLineRow = [...receiptLineRow, receiptLine.inventoryAttribute2 == null ? "" : receiptLine.inventoryAttribute2];
        }
        if (this.inventoryConfiguration?.inventoryAttribute3Enabled == true) {
          receiptLineRow = [...receiptLineRow, receiptLine.inventoryAttribute3 == null ? "" : receiptLine.inventoryAttribute3];
        }
        if (this.inventoryConfiguration?.inventoryAttribute4Enabled == true) {
          receiptLineRow = [...receiptLineRow, receiptLine.inventoryAttribute4 == null ? "" : receiptLine.inventoryAttribute4];
        }
        if (this.inventoryConfiguration?.inventoryAttribute5Enabled == true) {
          receiptLineRow = [...receiptLineRow, receiptLine.inventoryAttribute5 == null ? "" : receiptLine.inventoryAttribute5];
        }

        rows = [...rows, receiptLineRow];
      }
    )           
    return rows;

 
  }
 
  
  exportReceivedInventory() {  
       
    var columnNames = this.getReceivedInventoryExportExcelColumns();
    
    this.isSpinning = true;

    let receiptIds: string = this.listOfAllReceipts.map(receipt => receipt.id!).join(",")
    this.receiptService.getReceivedInventoryFromReceiptList(receiptIds).subscribe({

      next: (receivedInventoryList) => {

        this.isSpinning = false;
        var contents = this.getReceivedInventoryExportExcelRows(receivedInventoryList);

        var worksheet = XLSX.utils.aoa_to_sheet([
          columnNames, 
          ...contents
        ]); 
        /* generate workbook and add the worksheet */
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'received_inventory');
    
        /* save to file */
        XLSX.writeFile(workbook,`received_inventory.xlsx`);
       
      }
      ,
      error: () => this.isSpinning = false
    })
    

  }
  
  getReceivedInventoryExportExcelColumns() : string[]   {

    let columnNames : string[] = [];

    if (this.threePartyLogisticsFlag) {
      columnNames = [...columnNames, this.i18n.fanyi("client")];  
    }
    columnNames = [...columnNames, this.i18n.fanyi("receipt.number")];   
    columnNames = [...columnNames, this.i18n.fanyi("receipt.line.number")];  
    columnNames = [...columnNames, this.i18n.fanyi("lpn")];   
    columnNames = [...columnNames, this.i18n.fanyi("item")]; 
    columnNames = [...columnNames, this.i18n.fanyi("item.package-type")]; 
    columnNames = [...columnNames, this.i18n.fanyi("location")]; 
    columnNames = [...columnNames, this.i18n.fanyi("quantity"), this.i18n.fanyi("unitOfMeasure")];  
    columnNames = [...columnNames, this.i18n.fanyi("inventory.status")]; 
    columnNames = [...columnNames, this.i18n.fanyi("fifoDate")]; 
    columnNames = [...columnNames, this.i18n.fanyi("color")]; 
    columnNames = [...columnNames, this.i18n.fanyi("productSize")]; 
    columnNames = [...columnNames, this.i18n.fanyi("style")]; 
    columnNames = [...columnNames, this.i18n.fanyi("inWarehouseDate")]; 

    if ( this.inventoryConfiguration?.inventoryAttribute1Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName];
    }
    if ( this.inventoryConfiguration?.inventoryAttribute2Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName];
    }
    if ( this.inventoryConfiguration?.inventoryAttribute3Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName];
    }
    if ( this.inventoryConfiguration?.inventoryAttribute4Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName];
    }
    if ( this.inventoryConfiguration?.inventoryAttribute5Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName];
    } 
    return columnNames;
  }
  
  getReceivedInventoryExportExcelRows(inventoryList: Inventory[]) : string[][]   {
    let rows: string[][] = [];

    inventoryList.forEach(
      inventory => rows = [...rows, this.getReceivedInventoryExportExcelRow(inventory)]
    )
    return rows;
  }
  
  getReceivedInventoryExportExcelRow(inventory: Inventory) : string[]   {
    let row : string[] = [];
    this.calculateInventoryDisplayQuantity(inventory);

    if (this.threePartyLogisticsFlag) {
      row = [...row, inventory.client == null ? "" : inventory.client.name];
    } 
    row = [...row, inventory.receiptNumber == null ? "" : inventory.receiptNumber]; 
    row = [...row, inventory.receiptLineNumber == null ? "" : inventory.receiptLineNumber]; 

      row = [...row, inventory.lpn == null ? "" : inventory.lpn]; 
      row = [...row, inventory.item == null ? "" : inventory.item.name];   
      row = [...row, inventory.itemPackageType == null ? "" : inventory.itemPackageType.name!];   
      row = [...row, inventory.locationName == null ? "" : inventory.locationName];   
      row = [...row, 
        (inventory.displayQuantity == null ? "" : inventory.displayQuantity.toString()), 
        (inventory.itemPackageType  == null || 
          inventory.itemPackageType.displayItemUnitOfMeasure   == null ||
          inventory.itemPackageType.displayItemUnitOfMeasure.unitOfMeasure == null ?
            "" :
            inventory.itemPackageType.displayItemUnitOfMeasure.unitOfMeasure.name)];    
      row = [...row, inventory.inventoryStatus == null ? "" : inventory.inventoryStatus.name!];   
      row = [...row, inventory.fifoDate == null ? "" : 
           `${this.datePipe.transform(inventory.fifoDate, 'MM/dd/yyyy')}`];    
      row = [...row, inventory.color == null ? "" : inventory.color];    
      row = [...row, inventory.productSize == null ? "" : inventory.productSize];    
      row = [...row, inventory.style == null ? "" : inventory.style];    
      row = [...row, inventory.inWarehouseDatetime == null ? "" : 
      `${this.datePipe.transform(inventory.inWarehouseDatetime, 'MM/dd/yyyy')}`];    
    if (this.inventoryConfiguration?.inventoryAttribute1Enabled == true) {
      row = [...row, inventory.attribute1 == null ? "" : inventory.attribute1];   
    }
    if (this.inventoryConfiguration?.inventoryAttribute2Enabled == true) {
      row = [...row, inventory.attribute2 == null ? "" : inventory.attribute2];   
    }
    if (this.inventoryConfiguration?.inventoryAttribute3Enabled == true) {
      row = [...row, inventory.attribute3 == null ? "" : inventory.attribute3];   
    }
    if (this.inventoryConfiguration?.inventoryAttribute4Enabled == true) {
      row = [...row, inventory.attribute4 == null ? "" : inventory.attribute4];   
    }
    if (this.inventoryConfiguration?.inventoryAttribute5Enabled == true) {
      row = [...row, inventory.attribute5 == null ? "" : inventory.attribute5];   
    }

    return row;
  }


  openModifyReceiptLineModal(
    receipt: Receipt, 
    receiptLine: ReceiptLine, 
    tplReceiptLineModalTitle: TemplateRef<{}>, 
    tplReceiptLineModalContent: TemplateRef<{}>): void {
 
    this.currentProcessingReceiptLine = receiptLine;

    // show the model
    this.addOrModifyReceiptLineModal = this.modalService.create({
      nzTitle: tplReceiptLineModalTitle,
      nzContent: tplReceiptLineModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addOrModifyReceiptLineModal.destroy();
        this.search();
      },
      nzOnOk: () => {
        this.modifyReceiptLine(receipt.id!, this.currentProcessingReceiptLine!);
        return false;
      },
      nzWidth: 1000,
    });
  }

  
  modifyReceiptLine(receiptId: number, receiptLine: ReceiptLine): void {
    this.isSpinning = true;
    this.receiptLineService.changeReceiptLine(receiptId, receiptLine).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.addOrModifyReceiptLineModal.destroy();
        this.isSpinning = false;
        this.search()
      }, 
      error: () => this.isSpinning = false
    });
  }
   
  currentProcessingReceiptLineItemNumberChanged(event: Event): void {
    const itemName: string = (event.target as HTMLInputElement).value;
    this.handleCurrentProcessingReceiptLineItemNumberChanged(itemName)
  }

  handleCurrentProcessingReceiptLineItemNumberChanged(itemName: any): void { 
    if (itemName) {
      this.itemService
        .getItems(itemName.trim())
        .subscribe(items => (this.currentProcessingReceiptLine!.item = items.length === 1 ? items[0] : undefined));
    } else {
      this.currentProcessingReceiptLine!.item = undefined;
    }
    
  }

}
