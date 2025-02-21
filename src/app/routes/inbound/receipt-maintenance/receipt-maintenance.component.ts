import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { Client } from '../../common/models/client';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { Supplier } from '../../common/models/supplier';
import { ClientService } from '../../common/services/client.service';
import { PrintingService } from '../../common/services/printing.service';
import { SupplierService } from '../../common/services/supplier.service'; 
import { Inventory } from '../../inventory/models/inventory';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure';
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemPackageTypeService } from '../../inventory/services/item-package-type.service';
import { ItemService } from '../../inventory/services/item.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Receipt } from '../models/receipt';
import { ReceiptLine } from '../models/receipt-line';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { PutawayConfigurationService } from '../services/putaway-configuration.service';
import { ReceiptLineService } from '../services/receipt-line.service';
import { ReceiptService } from '../services/receipt.service';

@Component({
    selector: 'app-inbound-receipt-maintenance',
    templateUrl: './receipt-maintenance.component.html',
    standalone: false
})
export class InboundReceiptMaintenanceComponent implements OnInit {
  listOfReceiptLineTableColumns: Array<ColumnItem<ReceiptLine>> = [
    {
      name: 'receipt.line.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableString(a.number, b.number),
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
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.expectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.receivedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.receivedQuantity, b.receivedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.overReceivingQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.overReceivingQuantity, b.overReceivingQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.overReceivingPercent',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.overReceivingPercent, b.overReceivingPercent),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfReceivedInventoryTableColumns: Array<ColumnItem<Inventory>> = [];
  

  listOfReceiptLinesTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onReceiptLinesTableAllChecked(true);
      }
    },
  ];

  listOfReceivedInventoryTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onReceivedInventoryTableAllChecked(true);
      }
    },
  ];

  setOfReceiptLinesTableCheckedId = new Set<number>();
  receiptLinesTableChecked = false;
  receiptLinesTableIndeterminate = false;


  setOfReceivedInventoryTableCheckedId = new Set<number>();
  receivedInventoryTableChecked = false;
  receivedInventoryTableIndeterminate = false;
  newBatch = false;

  receiptForm!: UntypedFormGroup;
  receivingForm!: UntypedFormGroup;
  pageTitle: string;
  currentReceipt: Receipt = {
    id: undefined,
    number: '',
    client: undefined,
    clientId: undefined,
    supplier: undefined,
    supplierId: undefined,
    warehouseId: this.warehouseService.getCurrentWarehouse().id,
    receiptStatus: ReceiptStatus.OPEN,
    receiptLines: [],
    allowUnexpectedItem: false,
    receiptBillableActivities: [],
    receiptLineBillableActivities: []
  };

  validClients: Client[] = [];
  validSuppliers: Supplier[] = [];
  filterValidSuppliers: Supplier[] = []; 

  listOfAllReceiptLines: ReceiptLine[] = [];
  listOfDisplayReceiptLines: ReceiptLine[] = [];

  listOfAllReceivedInventory: Inventory[] = [];
  listOfDisplayReceivedInventory: Inventory[] = [];


  receivingModal!: NzModalRef;

  addReceiptLineModal!: NzModalRef;  
  currentReceiptLineUnitOfMeasure?: ItemUnitOfMeasure;

  manualPutawayModal!: NzModalRef;

  currentInventory!: Inventory;
  validInventoryStatuses: InventoryStatus[] = [];
  availableInventoryStatus?: InventoryStatus;


  currentReceiptLine!: ReceiptLine;
  currentReceivingLine!: ReceiptLine; 
  currentReceivingInventory?: Inventory;
  currentReceivingUnitOfMeasure?: ItemUnitOfMeasure;
  currentReceivingLPNStatus = 'error';
  currentReceivingQuantityStatus = 'error'; 

  receiptStatus = ReceiptStatus;

  selectedTabIndex = 0;
  printingInProcess = false;
  printingPutawayWork = false;
  displayItemPackageType: ItemPackageType | undefined;
  receivingInProcess = false;

  threePartyLogisticsFlag = false;

  
  reverseInventoryForm!: UntypedFormGroup;
  reverseInventoryModal!: NzModalRef;
  
  recalculateQCForm!: UntypedFormGroup;
  recalculateQCModal!: NzModalRef;
  formatterPercent = (value: number): string => `${value} %`;
  parserPercent = (value: string): string => value.replace(' %', '');

  inventoryConfiguration?: InventoryConfiguration;
  
  isSpinning = false;
  // how to print putaway work
  // all: print everything recevied, include the one that already in stock
  // allReceived: print everything that is received and still not putaway yet
  // selected: print only selected record
  printPutawayWorkType = "all";
  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private receiptService: ReceiptService,
    private receiptLineService: ReceiptLineService,
    private clientService: ClientService,
    private supplierService: SupplierService,
    private modalService: NzModalService,
    private itemPackageTypeService: ItemPackageTypeService,
    private inventoryStatusService: InventoryStatusService,
    private putawayConfigurationService: PutawayConfigurationService,
    private itemService: ItemService,
    private locationService: LocationService,
    private inventoryService: InventoryService,
    private message: NzMessageService,
    private warehouseService: WarehouseService,
    private utilService: UtilService,
    private router: Router,
    private printingService: PrintingService,
    private messageService: NzMessageService,
    private localCacheService: LocalCacheService,
    private notification: NzNotificationService,
    private inventoryConfigurationService: InventoryConfigurationService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inbound.receipt.title');
    
    
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
          
          this.setupReceivedInventoryTableColumns();
        }  
      } ,  
      error: () =>  this.setupReceivedInventoryTableColumns()
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inbound.receipt.title'));

    this.receiptForm = this.fb.group({
      receiptId: [null],
      receiptNumber: ['', [Validators.required]],
      client: [null],
      supplier: [null],
      allowUnexpectedItem: [false],
    });
    this.receiptForm.controls.receiptId.disable();

    this.clientService.getClients().subscribe({
      next: (clientRes) => {
        this.validClients = clientRes;
      }, 
    }); 
    
    this.activatedRoute.queryParams.subscribe(params => {
      
      if (params.receiptNumber) { 
        this.loadReceipt(params.receiptNumber); 
        this.newBatch = false;
      } else {
        this.listOfAllReceiptLines = [];
        this.listOfDisplayReceiptLines = [];
        this.newBatch = true;
      }
    });

    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
      
    this.inventoryStatusService.getAvailableInventoryStatuses()
    .subscribe(inventoryStatuses => {
      if (inventoryStatuses.length > 0) {
        this.availableInventoryStatus = inventoryStatuses[0];
      }
    });

    this.supplierService.loadSuppliers().subscribe(suppliers => {
      this.validSuppliers = [...suppliers];
      this.filterValidSuppliers = [...suppliers]
    });

    
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        }  
      },  
    });

  }
  onSupplierChange(value: string): void {
    if (value == null || value == "") {
      this.filterValidSuppliers = [...this.validSuppliers];
    }
    else {
      this.filterValidSuppliers = this.filterValidSuppliers.filter(
        supplier => supplier.description.toLowerCase().indexOf(value.toLowerCase()) !== -1);

    }
  }

  setupReceivedInventoryTableColumns() {

    this.listOfReceivedInventoryTableColumns = [
    {
      name: 'lpn',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.lpn, b.lpn),
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
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
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
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
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
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    
    {
      name: 'color',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.color, b.color),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'productSize',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.productSize, b.productSize),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'style',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.style, b.style),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }];
    
    if (this.inventoryConfiguration?.inventoryAttribute1Enabled) {      
        this.listOfReceivedInventoryTableColumns = [...this.listOfReceivedInventoryTableColumns,
          {
            name: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
                this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,
            showSort: true,
            sortOrder: null,
            sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.attribute1, b.attribute1),
            sortDirections: ['ascend', 'descend'],
            filterMultiple: true,
            listOfFilter: [],
            filterFn: null,
            showFilter: false
          },
        ]
    }
    if (this.inventoryConfiguration?.inventoryAttribute2Enabled) {      
        this.listOfReceivedInventoryTableColumns = [...this.listOfReceivedInventoryTableColumns,
          {
            name: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
                this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,
            showSort: true,
            sortOrder: null,
            sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.attribute2, b.attribute2),
            sortDirections: ['ascend', 'descend'],
            filterMultiple: true,
            listOfFilter: [],
            filterFn: null,
            showFilter: false
          },
        ]
    }
    if (this.inventoryConfiguration?.inventoryAttribute3Enabled) {      
        this.listOfReceivedInventoryTableColumns = [...this.listOfReceivedInventoryTableColumns,
          {
            name: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
                this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,
            showSort: true,
            sortOrder: null,
            sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.attribute3, b.attribute3),
            sortDirections: ['ascend', 'descend'],
            filterMultiple: true,
            listOfFilter: [],
            filterFn: null,
            showFilter: false
          },
        ]
    }
    if (this.inventoryConfiguration?.inventoryAttribute4Enabled) {      
        this.listOfReceivedInventoryTableColumns = [...this.listOfReceivedInventoryTableColumns,
          {
            name: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
                this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,
            showSort: true,
            sortOrder: null,
            sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.attribute4, b.attribute4),
            sortDirections: ['ascend', 'descend'],
            filterMultiple: true,
            listOfFilter: [],
            filterFn: null,
            showFilter: false
          },
        ]
    }
    if (this.inventoryConfiguration?.inventoryAttribute5Enabled) {      
        this.listOfReceivedInventoryTableColumns = [...this.listOfReceivedInventoryTableColumns,
          {
            name: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
                this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,
            showSort: true,
            sortOrder: null,
            sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.attribute5, b.attribute5),
            sortDirections: ['ascend', 'descend'],
            filterMultiple: true,
            listOfFilter: [],
            filterFn: null,
            showFilter: false
          },
        ]
    }
    this.listOfReceivedInventoryTableColumns = [...this.listOfReceivedInventoryTableColumns,
      {
        name: 'location',
        showSort: true,
        sortOrder: null,
        sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false
      },
      {
        name: 'nextLocation',
        showSort: false,
        sortOrder: null,
        sortFn: null,
        sortDirections: ['ascend', 'descend'],
        filterMultiple: true,
        listOfFilter: [],
        filterFn: null,
        showFilter: false
      },
    ];
  }

  saveReceipt(): void {
    // Setup the value
    this.isSpinning = true;
    this.currentReceipt.id = this.receiptForm!.controls.receiptId.value;
    this.currentReceipt.number = this.receiptForm!.controls.receiptNumber.value;

    // Get the client by name
    const client = this.getClientByName(this.receiptForm!.controls.client.value);
    this.currentReceipt.clientId = client ? client.id : undefined;
    this.currentReceipt.client = client ? client : undefined;

    // Get the supplier by name
    const supplier = this.getSupplierByName(this.receiptForm!.controls.supplier.value);
    this.currentReceipt.supplierId = supplier ? supplier.id : undefined;
    this.currentReceipt.supplier = supplier ? supplier : undefined;

    if (this.currentReceipt.id) {
      // we are changing an exiting receipt
      this.receiptService.changeReceipt(this.currentReceipt).subscribe({
        next: () => {
          this.refreshReceiptResults();
          this.message.success(this.i18n.fanyi('message.save.complete'));
          this.isSpinning = false
        }, 
        error: () => this.isSpinning = false
      });
    } else {
      // we are creating a new receipt
      this.receiptService.addReceipt(this.currentReceipt).subscribe({
        next: (res) => {
          this.currentReceipt = res;
          this.setupDisplayForExistingReceipt();
          this.message.success(this.i18n.fanyi('message.new.complete'));
          this.newBatch = false;

          this.receiptForm!.controls.receiptId.setValue(res.id);
          this.receiptForm!.controls.receiptId.disable();
          this.receiptForm!.controls.receiptNumber.setValue(res.number);
          this.receiptForm!.controls.receiptNumber.disable();
          this.isSpinning = false;

        }, 
        error: () => this.isSpinning = false
        
        
      });
    }
  }

  getClientByName(name: string): Client | null {
    const clients = this.validClients.filter(client => client.name === name);
    if (clients.length > 0) {
      return clients[0];
    } else {
      return null;
    }
  }

  getSupplierByName(name: string): Supplier | null {
    const suppliers = this.validSuppliers.filter(supplier => supplier.name === name);
    if (suppliers.length > 0) {
      return suppliers[0];
    } else {
      return null;
    }
  }

  clearDisplay(): void {
    this.listOfAllReceiptLines = [];
    this.listOfDisplayReceiptLines = [];

    this.listOfAllReceivedInventory = [];
    this.listOfDisplayReceivedInventory = [];

    this.receiptForm!.controls.receiptId.setValue('');
    this.receiptForm!.controls.receiptNumber.setValue('');
    this.receiptForm!.controls.receiptNumber.enable();

    // this.receiptForm.controls.client.setValue('');
    // this.receiptForm.controls.supplier.setValue('');
  }

  setupDisplayForExistingReceipt(): void {
    this.listOfAllReceiptLines = this.currentReceipt.receiptLines;
    this.listOfDisplayReceiptLines = this.currentReceipt.receiptLines;

    this.receiptForm!.controls.receiptId.setValue(this.currentReceipt.id);
    this.receiptForm!.controls.receiptId.disable();
    this.receiptForm!.controls.receiptNumber.setValue(this.currentReceipt.number);
    this.receiptForm!.controls.receiptNumber.disable();
    this.receiptForm!.controls.client.disable();

    this.receiptForm!.controls.client.setValue(this.currentReceipt.client ? this.currentReceipt.client.id : '');
    this.receiptForm!.controls.supplier.setValue(this.currentReceipt.supplier ? this.currentReceipt.supplier.name : '');

    this.loadReceivedInventory(this.currentReceipt);

    // setup the display quantity for each line
    this.calculateDisplayQuanties(this.currentReceipt);

  }

  calculateDisplayQuanties(receipt: Receipt) : void { 
    receipt.receiptLines.forEach(
      receiptLine => {
          this.calculateReceiptLineDisplayQuantity(receiptLine);
      }
    )
  }
  
  calculateReceiptLineDisplayQuantity(receiptLine: ReceiptLine) : void { 
         // see if we have the display UOM setup
          // if the display item unit of measure is setup for the item
          // then we will update the display quantity accordingly.
          // the same logic for both expected quantity and received quantity
          // 1. if the quantity can be divided by the display UOM's quantity, then display
          //    the quantity in display UOM and setup the display UOM for each quantity accordingly
          // 2. otherwise, setup teh quantity in stock UOM and use the stock UOM as the display quantity
          //    for each quantity
          if (receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure) {
            // console.log(`>> found displayItemUnitOfMeasure: ${receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure?.name}`)
            let displayItemUnitOfMeasureQuantity  = receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.quantity;

            // console.log(`>> with quantity ${displayItemUnitOfMeasureQuantity}`)

            if (receiptLine.expectedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
              receiptLine.displayUnitOfMeasureForExpectedQuantity = receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure;
              receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity! / displayItemUnitOfMeasureQuantity!
            }
            else {
              // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
              // stock uom
              receiptLine.displayExpectedQuantity! = receiptLine.expectedQuantity!;
              // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
              receiptLine.displayUnitOfMeasureForExpectedQuantity = receiptLine.item?.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure;
            }
            
            if (receiptLine.receivedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
              receiptLine.displayReceivedQuantity = receiptLine.receivedQuantity! / displayItemUnitOfMeasureQuantity!
              receiptLine.displayUnitOfMeasureForReceivedQuantity = receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure;
            }
            else {
              // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
              // stock uom
              receiptLine.displayReceivedQuantity! = receiptLine.receivedQuantity!;
              // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
              receiptLine.displayUnitOfMeasureForReceivedQuantity = receiptLine.item?.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure;
            }
          }
          else {
            // there's no display UOM setup for this inventory, we will display
            // by the quantity
              receiptLine.displayExpectedQuantity = receiptLine.expectedQuantity!;
              receiptLine.displayReceivedQuantity! = receiptLine.receivedQuantity!;
          }  
  }

  receiptNumberOnBlur(event: Event): void {
    // When we use the 'fkey' to automatically generate the next receipt number
    // the reactive form control may not have the right value.Let's set
    // the number back to the bind control
    this.receiptForm!.controls.receiptNumber.setValue((event.target as HTMLInputElement).value);
    this.refreshReceiptResults();
  }

  refreshReceiptResults(selectedTabIndex: number = 0): void {
    this.isSpinning = true;
    this.selectedTabIndex = selectedTabIndex;
    const receiptNumber = this.receiptForm!.controls.receiptNumber.value;
    if (receiptNumber) {
      this.loadReceipt(receiptNumber);
    } else {
      this.clearDisplay();
      this.isSpinning = false;
    }
  }

  loadReceipt(receiptNumber: string): void {
    
    this.isSpinning = true;
    this.receiptService.getReceipts(receiptNumber).subscribe(receipts => {
       

      if (receipts.length > 0) {
        this.currentReceipt = receipts[0];
        this.setupDisplayForExistingReceipt();
      } else {
        this.clearDisplay();
        // in case the receipt doesn't exists yet, let's set the
        // receipt number control as the input value
        this.receiptForm!.controls.receiptNumber.setValue(receiptNumber);
        console.log(`this.receiptForm.controls.receiptNumber: ${this.receiptForm!.controls.receiptNumber.value}`);
      }
      this.isSpinning = false;
    });
  }
  calculateQuantities(receipt: Receipt): Receipt {
    const existingItemIds = new Set();
    receipt.totalExpectedQuantity = 0;
    receipt.totalReceivedQuantity = 0;
    receipt.totalLineCount = receipt.receiptLines.length;

    receipt.receiptLines.forEach(receiptLine => {
      receipt.totalExpectedQuantity! += receiptLine.expectedQuantity!;
      receipt.totalReceivedQuantity! += receiptLine.receivedQuantity!;
      if (!existingItemIds.has(receiptLine.item!.id)) {
        existingItemIds.add(receiptLine.item!.id);
      }
    });
    receipt.totalItemCount = existingItemIds.size;
    return receipt;
  }

  loadReceivedInventory(receipt: Receipt): void {
    this.receiptService.getReceivedInventory(receipt).subscribe(inventories => {
      this.listOfAllReceivedInventory = inventories;
      this.listOfDisplayReceivedInventory = inventories;
    });
  }

  updateReceiptLinesTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfReceiptLinesTableCheckedId.add(id);
    } else {
      this.setOfReceiptLinesTableCheckedId.delete(id);
    }
  }

  onReceiptLinesTableItemChecked(id: number, checked: boolean): void {
    this.updateReceiptLinesTableCheckedSet(id, checked);
    this.refreshReceiptLinesTableCheckedStatus();
  }

  onReceiptLinesTableAllChecked(value: boolean): void {
    this.listOfDisplayReceivedInventory!.forEach(item => this.updateReceiptLinesTableCheckedSet(item.id!, value));
    this.refreshReceiptLinesTableCheckedStatus();
  }

  receiptLinesTableCurrentPageDataChange($event: ReceiptLine[]): void {
    this.listOfDisplayReceivedInventory! = $event;
    this.refreshReceiptLinesTableCheckedStatus();
  }

  refreshReceiptLinesTableCheckedStatus(): void {
    this.receiptLinesTableChecked =
      this.listOfDisplayReceivedInventory!.every(item => this.setOfReceiptLinesTableCheckedId.has(item.id!));
    this.receiptLinesTableIndeterminate =
      this.listOfDisplayReceivedInventory!.some(item => this.setOfReceiptLinesTableCheckedId.has(item.id!)) && !this.receiptLinesTableChecked;
  }

  updateReceivedInventoryTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfReceivedInventoryTableCheckedId.add(id);
    } else {
      this.setOfReceivedInventoryTableCheckedId.delete(id);
    }
  }

  onReceivedInventoryTableItemChecked(id: number, checked: boolean): void {
    this.updateReceivedInventoryTableCheckedSet(id, checked);
    this.refreshReceivedInventoryTableCheckedStatus();
  }

  onReceivedInventoryTableAllChecked(value: boolean): void {
    this.listOfDisplayReceivedInventory!.forEach(item => this.updateReceivedInventoryTableCheckedSet(item.id!, value));
    this.refreshReceivedInventoryTableCheckedStatus();
  }

  receivedInventoryTableCurrentPageDataChange($event: ReceiptLine[]): void {
    this.listOfDisplayReceivedInventory! = $event;
    this.refreshReceivedInventoryTableCheckedStatus();
  }

  refreshReceivedInventoryTableCheckedStatus(): void {
    this.receivedInventoryTableChecked =
      this.listOfDisplayReceivedInventory!.every(item => this.setOfReceivedInventoryTableCheckedId.has(item.id!));
    this.receivedInventoryTableIndeterminate =
      this.listOfDisplayReceivedInventory!.some(item => this.setOfReceivedInventoryTableCheckedId.has(item.id!)) && !this.receiptLinesTableChecked;
  }

  getSelectedReceiptLines(): ReceiptLine[] {
    /***
     * 
     */
    const selectedReceiptLines: ReceiptLine[] = [];
    const selectedReceiptLineIdSet = new Set();
    // we will only return the selected data from the current page
    // this.st.list will only return data from current page
    const receiptLineDataList : STData[] = this.st.list;
    receiptLineDataList.filter(receiptLineRow => receiptLineRow.checked).forEach(
      receiptLineRow => { 
        selectedReceiptLineIdSet.add(receiptLineRow["id"])}
    )
    
    
    this.listOfAllReceiptLines.forEach((receiptLine: ReceiptLine) => {
      if (selectedReceiptLineIdSet.has(receiptLine.id!)) {
        selectedReceiptLines.push(receiptLine);
      }
    });
    return selectedReceiptLines;
  }

  getSelectedReceivedInventory(): Inventory[] {
    const selectedReceivedInventory: Inventory[] = [];
    this.listOfDisplayReceivedInventory.forEach((inventory: Inventory) => {
      if (this.setOfReceivedInventoryTableCheckedId.has(inventory.id!)) {
        selectedReceivedInventory.push(inventory);
      }
    });
    return selectedReceivedInventory;
  }

  printPutawayWork(event: any) {

    switch (this.printPutawayWorkType) {
      case "all":
        this.printAllPutawayWork(event);
        break;
      case "allReceived":
        this.printAllReceivedPutawayWork(event);
        break;
      case "selected":
        this.printSelectedPutawayWork(event);
        break;
      default:
        this.printAllPutawayWork(event);
        break;
    }

  }
  previewPutawayReport() {

    switch (this.printPutawayWorkType) {
      case "all":
        this.previewAllPutawayWork(event);
        break;
      case "allReceived":
        this.previewAllReceivedPutawayWork(event);
        break;
      case "selected":
        this.previewSelectedPutawayWork(event);
        break;
      default:
        this.previewAllPutawayWork(event);
        break;
    }

  }
  printPutawayDocument(event: any,
    receipt: Receipt, inventoryIds: number[],
    notPutawayInventoryOnly = false): void {


    this.isSpinning = true;
    console.log(`start to print ${this.currentReceipt.number} `);

    this.receiptService.printPutawayDocument(
      receipt, inventoryIds, notPutawayInventoryOnly,
      this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        this.printingService.printFileByName(
          "Putaway Document",
          printResult.fileName,
          ReportType.PUTAWAY_DOCUMENT,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          this.currentReceipt.number, 
          printResult, event.collated);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );
  }

  previewPutawayDocument(event: any,
    receipt: Receipt, inventoryIds: number[],
    notPutawayInventoryOnly = false): void {

    this.isSpinning = true;
    console.log(`start to preview putaway document for ${this.currentReceipt.number}`);


    this.receiptService.printPutawayDocument(
      receipt, inventoryIds, notPutawayInventoryOnly,
      this.i18n.currentLang)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },
      );

  }
  printSelectedPutawayWork(event: any): void {
    let selectedInventory = this.getSelectedInventory().map(
      inventory => inventory.id!
    );
    this.printPutawayDocument(event, this.currentReceipt,
      selectedInventory);
  }
  previewSelectedPutawayWork(event: any): void {
    let selectedInventory = this.getSelectedInventory().map(
      inventory => inventory.id!
    );
    this.previewPutawayDocument(event, this.currentReceipt,
      selectedInventory);
  }

  printAllReceivedPutawayWork(event: any): void {
    this.printPutawayDocument(event, this.currentReceipt,
      [], true);

  }
  previewAllReceivedPutawayWork(event: any): void {
    this.previewPutawayDocument(event, this.currentReceipt,
      [], true);

  }

  printAllPutawayWork(event: any): void {

    this.printPutawayDocument(event, this.currentReceipt,
      []);
  }

  previewAllPutawayWork(event: any): void {

    this.previewPutawayDocument(event, this.currentReceipt,
      []);
  }
  getSelectedInventory(): Inventory[] {
    const selectedInventories: Inventory[] = [];
    this.listOfAllReceivedInventory.forEach((inventory: Inventory) => {
      if (this.setOfReceivedInventoryTableCheckedId.has(inventory.id!)) {
        selectedInventories.push(inventory);
      }
    });
    return selectedInventories;
  }

  validateItemReadyForReceiving(receiptLine: ReceiptLine) : string {
    if (receiptLine.item == null) {
      return this.i18n.fanyi("no-item-on-receipt-line");
    }
    if (receiptLine.item!.itemPackageTypes == null || receiptLine.item!.itemPackageTypes.length == 0) {
      return this.i18n.fanyi("no-item-packate-type-setup");
    }


    return '';
  }

  openReceivingModal(
    receiptLine: ReceiptLine,
    tplReceivingModalTitle: TemplateRef<{}>,
    tplReceivingModalContent: TemplateRef<{}>,
    tplReceivingModalFooter: TemplateRef<{}>,
  ): void {
    // make sure the item is ready for receiving
    const itemNotReadyError = this.validateItemReadyForReceiving(receiptLine);
    if (itemNotReadyError != null && itemNotReadyError != '') {

      this.showError(this.i18n.fanyi("item-not-ready-for-receiving"), itemNotReadyError);
      return;
    }

    this.createReceivingForm(receiptLine);
    this.receivingInProcess = false;
    
    // set those 2 field to status error to indicate those 2
    // are required fields
    this.currentReceivingLPNStatus = 'error';
    this.currentReceivingQuantityStatus = 'error'; 

    this.currentReceivingInventory = this.createEmptyReceivingInventory(receiptLine);
    this.currentReceivingUnitOfMeasure = undefined;
 
    // show the model
    this.receivingModal = this.modalService.create({
      nzTitle: tplReceivingModalTitle,
      nzContent: tplReceivingModalContent,
      nzFooter: tplReceivingModalFooter,
      nzWidth: 1000,
    });
    this.receivingModal.afterOpen.subscribe(() => this.setupDefaultInventoryValue());
  }
  closeReceivingModal(): void {
    this.receivingModal.destroy();
    this.refreshReceiptResults();
  }
  confirmReceiving(): void {
    this.receivingInProcess = true;
    this.isSpinning = true;
    this.receivingInventory();
  }

  createReceivingForm(receiptLine: ReceiptLine): void {
    // reset the displayed item package type
    this.displayItemPackageType = undefined;
    this.currentReceivingLine = receiptLine;
    this.receivingForm = this.fb.group({
      itemNumber: new UntypedFormControl({ value: receiptLine.item!.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: receiptLine.item!.description, disabled: true }),
      lpn:   ['', Validators.required],
      inventoryStatus: [''],
      itemPackageType: ['', Validators.required],
      quantity: ['', Validators.required],
      itemUnitOfMeasure: ['', Validators.required],
      locationName: ['']
    },
    {
      updateOn: 'blur'
    });
  }
  openManualPutawayModal(
    inventory: Inventory,
    tplManualPutawayModalTitle: TemplateRef<{}>,
    tplManualPutawayModalContent: TemplateRef<{}>,
  ): void {
    this.currentInventory = inventory;
    // Load the location
    this.manualPutawayModal = this.modalService.create({
      nzTitle: tplManualPutawayModalTitle,
      nzContent: tplManualPutawayModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.manualPutawayModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.manualPutawayInventory(this.currentInventory!);
      },
      nzWidth: 1000,
    });
  }
  manualPutawayInventory(inventory: Inventory): void {
    if (inventory.locationName) {
      // Location name is setup
      // Let's find the location by name and assign it to the inventory
      // that will be received
      console.log(`Will setup received inventory's location to ${inventory.locationName}`);

      this.locationService.getLocations(undefined, undefined, inventory.locationName).subscribe(locations => {
        // There should be only one location returned.
        // Move the inventory to the location
        this.inventoryService.move(inventory, locations[0]).subscribe(() => {
          this.message.success(this.i18n.fanyi('message.action.success'));
          this.refreshReceiptResults();
        });
      });
    }
  }

  lpnNumberChanged(newLPN: string) {
    
    this.currentReceivingInventory!.lpn = newLPN;
  }
  receivingLPNChanged(event: Event): void {
    this.receivingForm!.controls.lpn.setValue((event.target as HTMLInputElement).value);
    // this.currentInventory.lpn = 
  }
  /**
   * 
   * 
  setupDefaultInventoryValue(): void {
    if (this.currentReceivingLine.item!.itemPackageTypes.length === 1) {
      this.receivingForm!.controls.itemPackageType.setValue(this.currentReceivingLine.item!.itemPackageTypes[0].id);
      this.displayItemPackageType = this.currentReceivingLine.item!.itemPackageTypes[0];
      this.newInventoryItemPackageTypeChanged(this.currentReceivingLine.item!.itemPackageTypes[0].id!);
    }
    if (this.validInventoryStatuses.length === 1) {
      this.receivingForm!.controls.inventoryStatus.setValue(this.validInventoryStatuses[0].id);
    }
    else if (this.availableInventoryStatus != null) {
      this.receivingForm!.controls.inventoryStatus.setValue(this.availableInventoryStatus.id);

    }
  }
   */
  setupDefaultInventoryValue(): void {
    if (this.currentReceivingLine.item!.itemPackageTypes.length === 1) {
      // this.receivingForm!.controls.itemPackageType.setValue(this.currentReceivingLine.item!.itemPackageTypes[0].id);
      this.currentReceivingInventory!.itemPackageType = this.currentReceivingLine.item!.itemPackageTypes[0];
      this.displayItemPackageType = this.currentReceivingLine.item!.itemPackageTypes[0];
      this.newInventoryItemPackageTypeChanged(this.currentReceivingLine.item!.itemPackageTypes[0].id!);
    }
    if (this.validInventoryStatuses.length === 1) {
      this.currentReceivingInventory!.inventoryStatus = this.validInventoryStatuses[0];
      // this.receivingForm!.controls.inventoryStatus.setValue(this.validInventoryStatuses[0].id);
    }
    else if (this.availableInventoryStatus != null) {
      this.currentReceivingInventory!.inventoryStatus = this.availableInventoryStatus;
      // this.receivingForm!.controls.inventoryStatus.setValue(this.availableInventoryStatus.id);

    }

    // console.log(`this.currentReceivingInventory!.item\n ${JSON.stringify(this.currentReceivingInventory!.item)}`);

    if (this.currentReceivingInventory!.item?.trackingColorFlag) {
      this.currentReceivingInventory!.color = this.currentReceivingInventory!.item.defaultColor;
    }
    if (this.currentReceivingInventory!.item?.trackingProductSizeFlag) {
      this.currentReceivingInventory!.productSize = this.currentReceivingInventory!.item.defaultProductSize;
    }
    if (this.currentReceivingInventory!.item?.trackingStyleFlag) {
      this.currentReceivingInventory!.style = this.currentReceivingInventory!.item.defaultStyle;
    }
  }

  inventoryStatusChange(receivingInventoryStatusId: number): void {
    this.currentReceivingInventory!.inventoryStatus = this.validInventoryStatuses.find(
      inventoryStatus => inventoryStatus.id == receivingInventoryStatusId
    ); 
  }

  /**
   * receiving inventory with reactive form
   * we may have issue with reactive form when the form is on the modal, which
   * cause the select control not return the right value
   * 
   * 
   * 
  receivingInventory(): void {
    if (this.receivingForm.valid) {
      // check if the location name is input. If so, we receive into that location
      // otherwise, we receive into the reciept location
      const locationName =
        this.receivingForm.controls.locationName.value === ''
          ? this.currentReceipt.number
          : this.receivingForm.controls.locationName.value;
      this.locationService.getLocations(undefined, undefined, locationName).subscribe(locations => {
        const inventory =  this.createReceivingInventory(this.currentReceivingLine, locations[0]);
        if (inventory != null) {
          this.receiptLineService
          .receiveInventory(
            this.currentReceipt.id!,
            this.currentReceivingLine.id!,
           inventory,
          ).subscribe({
            next: () => {
              this.message.success(this.i18n.fanyi('message.receiving.success'));

              this.receivingModal.destroy();
              this.receivingInProcess = false;
              this.isSpinning = false;

              this.refreshReceiptResults();
            },
            error: 
              () => {
                this.receivingInProcess = false;
                this.isSpinning = false;
              },
          });
        }        
      });
    } else {
      this.displayReceivingFormError(this.receivingForm);
      this.receivingInProcess = false;
      this.isSpinning = false;
    }
  }
   * 
   */
  receivingInventory(): void {
    // before we start receive inventory, let's first calculate the finaly quantity
    // based on the user input quantity and the UOM
    if (this.currentReceivingInventory!.quantity == null || this.currentReceivingInventory!.quantity == 0) {
      this.message.error("please fill in quantity");
      
      this.receivingInProcess = false;
      this.isSpinning = false;
      return;
    }
    if (this.currentReceivingInventory!.lpn == null ) {
      this.message.error("please fill in LPN");
      this.receivingInProcess = false;
      this.isSpinning = false;
      return;
    }
    // convert the receiving quantity into actual quantity
    // based on the quantity input and the UOM
    let actualReceivingInventory: Inventory = this.currentReceivingInventory!;
    
    if (this.currentReceivingUnitOfMeasure && this.currentReceivingUnitOfMeasure!.quantity! > 1) {
        console.log(`we will need to convert the quantity based on the uom`)
      // the user is receiving by a UOM, 
      actualReceivingInventory = { 
        lpn: this.currentReceivingInventory!.lpn,
        item: this.currentReceivingInventory!.item,
        itemPackageType: this.currentReceivingInventory!.itemPackageType,
        inventoryStatus: this.currentReceivingInventory!.inventoryStatus,
        quantity: this.currentReceivingInventory!.quantity * this.currentReceivingUnitOfMeasure!.quantity!,
        locationId: this.currentReceivingInventory!.locationId,
        location: this.currentReceivingInventory?.location,
        color: this.currentReceivingInventory?.color,
        productSize: this.currentReceivingInventory?.productSize,
        style: this.currentReceivingInventory?.style,
        attribute1: this.currentReceivingInventory?.attribute1,
        attribute2: this.currentReceivingInventory?.attribute2,
        attribute3: this.currentReceivingInventory?.attribute3,
        attribute4: this.currentReceivingInventory?.attribute4,
        attribute5: this.currentReceivingInventory?.attribute5,
      }

    }
    console.log(`actualReceivingInventory\n${JSON.stringify(actualReceivingInventory)}`)
    
    // if (this.receivingForm.valid) { 
      this.receiptLineService
          .receiveInventory(
            this.currentReceipt.id!,
            this.currentReceivingLine.id!,
            actualReceivingInventory
          ).subscribe({
            next: () => {
              this.message.success(this.i18n.fanyi('message.receiving.success'));

              this.receivingModal.destroy();
              this.receivingInProcess = false;
              this.isSpinning = false;

              this.refreshReceiptResults();
            },
            error: 
              () => {
                this.receivingInProcess = false;
                this.isSpinning = false;
              },
          });
          
    // } else {
    //  this.displayReceivingFormError(this.receivingForm);
    //  this.receivingInProcess = false;
    //  this.isSpinning = false;
    // }
  }
  displayReceivingFormError(fromGroup: UntypedFormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }

  createReceivingInventory(receiptLine: ReceiptLine, receiptLocation: WarehouseLocation): Inventory | undefined {
    const inventoryStatus = this.validInventoryStatuses
      .filter(
        availableInventoryStatus => availableInventoryStatus.id === this.receivingForm.controls.inventoryStatus.value,
      )
      .pop();
    const itemPackageType = receiptLine.item!.itemPackageTypes
      .filter(
        existingItemPackageType => existingItemPackageType.id === this.receivingForm.controls.itemPackageType.value,
      )
      .pop();
    
    console.log(`this.receivingForm.controls.itemUnitOfMeasure.value: ${this.receivingForm.controls.itemUnitOfMeasure.value}`)
    
    const itemUnitOfMeasure = itemPackageType?.itemUnitOfMeasures.find(
      itemUnitOfMeasure => itemUnitOfMeasure.id === this.receivingForm.controls.itemUnitOfMeasure.value,
    )

    console.log(`receive by item unit of measure \n ${JSON.stringify(itemUnitOfMeasure)}`)

    if (itemUnitOfMeasure == null) {
      this.messageService.error(this.i18n.fanyi("please choose UOM for receiving")); 
      return undefined;
    }
    else {

      return {
        id: undefined,
        lpn: this.receivingForm.controls.lpn.value,
        location: receiptLocation,
        locationName: receiptLocation.name,
        item: receiptLine.item,
        itemPackageType,
        quantity: this.receivingForm.controls.quantity.value * itemUnitOfMeasure.quantity!,
        inventoryStatus,
      };
    }
  }
  createEmptyReceivingInventory(receiptLine: ReceiptLine): Inventory {
    
    return {
      id: undefined,
      lpn: '', 
      item: receiptLine.item,  
    }; 
  }

  showAddReceiptLineModal(tplReceiptLineModalTitle: TemplateRef<{}>, tplReceiptLineModalContent: TemplateRef<{}>): void {
    const inventoryStatusOnReceiptLine = 
          this.availableInventoryStatus == null ? 
              (this.validInventoryStatuses != null && this.validInventoryStatuses.length > 0 ? 
                  this.validInventoryStatuses[0] : undefined)
              :
              this.availableInventoryStatus;

    this.currentReceiptLine = {
      id: undefined,
      number: undefined,
      item: undefined,
      expectedQuantity: 0,
      receivedQuantity: 0,
      overReceivingQuantity: 0,
      overReceivingPercent: 0,
      receiptLineBillableActivities: [],
      inventoryStatus: inventoryStatusOnReceiptLine,
      inventoryStatusId: inventoryStatusOnReceiptLine?.id,
      itemPackageTypeId: undefined
    };
    // calculate the next line number
    this.receiptLineService
      .getNextReceiptLineNumber(this.currentReceipt.id!)
      .subscribe(nextNumber => (this.currentReceiptLine.number = nextNumber));
    // show the model
    this.addReceiptLineModal = this.modalService.create({
      nzTitle: tplReceiptLineModalTitle,
      nzContent: tplReceiptLineModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addReceiptLineModal.destroy();
        this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.addReceiptLine(this.currentReceiptLine);
      },
      nzWidth: 1000,
    });
  }

  addReceiptLine(receiptLine: ReceiptLine): void {
    let actualReceiptLine: ReceiptLine = receiptLine;
    
    if (this.currentReceiptLineUnitOfMeasure && this.currentReceiptLineUnitOfMeasure!.quantity! > 1) {
        console.log(`we will need to convert the quantity based on the uom`)
      // the user is receiving by a UOM, 
      actualReceiptLine = { 
         
        number: receiptLine.number,
        item: receiptLine.item,
        expectedQuantity: receiptLine.expectedQuantity! * this.currentReceiptLineUnitOfMeasure!.quantity!,
        receivedQuantity: 0,
        overReceivingQuantity: receiptLine.overReceivingQuantity,
        overReceivingPercent: receiptLine.overReceivingQuantity,
        receiptLineBillableActivities: [],
        inventoryStatus: receiptLine.inventoryStatus,
        inventoryStatusId: receiptLine.inventoryStatusId,
        color: receiptLine.color,
        productSize: receiptLine.productSize,
        style: receiptLine.style,
        inventoryAttribute1: receiptLine.inventoryAttribute1,
        inventoryAttribute2: receiptLine.inventoryAttribute2,
        inventoryAttribute3: receiptLine.inventoryAttribute3,
        inventoryAttribute4: receiptLine.inventoryAttribute4,
        inventoryAttribute5: receiptLine.inventoryAttribute5,
        cubicMeter: receiptLine.cubicMeter,
        itemPackageTypeId: receiptLine.itemPackageTypeId,
      }

    }

    this.receiptLineService.createReceiptLine(this.currentReceipt.id!, actualReceiptLine).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.new.complete'));
      this.refreshReceiptResults();
    });
  }

  currentReceiptLineItemNumberChanged(event: Event): void {
    const itemName: string = (event.target as HTMLInputElement).value;
    this.itemNameChanged(itemName)
  }

  itemNameChanged(itemName: any): void { 
    if (itemName) {
      this.itemService
        .getItems(itemName.trim())
        .subscribe(items => (this.currentReceiptLine.item = items.length === 1 ? items[0] : undefined));
    } else {
      this.currentReceiptLine.item = undefined;
    }
    
  }

  removeSelectedReceiptLines(): void {
    const selectedReceiptLines = this.getSelectedReceiptLines();
    
    if (selectedReceiptLines.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.isSpinning = true;
          this.receiptLineService.removeReceiptLines(selectedReceiptLines).subscribe(
            {
              next: () => {
                
                this.message.success(this.i18n.fanyi('message.remove.success'));
                this.isSpinning = false;
                this.refreshReceiptResults(); 
              },
              error: () => this.isSpinning = false
            }
          );
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  allocateLocation(inventory: Inventory): void {
    this.isSpinning = true;
    this.putawayConfigurationService.allocateLocation(inventory).subscribe({
      next: (allocatedInventory) => {
        this.message.success(this.i18n.fanyi('message.allocate-location.success'));
        this.listOfAllReceivedInventory.forEach(receivedInventory => {
          if (receivedInventory.id === allocatedInventory.id) {
            receivedInventory.inventoryMovements = allocatedInventory.inventoryMovements;
          }
        });
        this.listOfDisplayReceivedInventory = this.listOfAllReceivedInventory;
        
          this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    }); 
  }

  reallocateLocation(inventory: Inventory): void {
    this.putawayConfigurationService.reallocateLocation(inventory).subscribe(allocatedInventory => {
      this.message.success(this.i18n.fanyi('message.allocate-location.success'));
      this.listOfAllReceivedInventory.forEach(receivedInventory => {
        if (receivedInventory.id === allocatedInventory.id) {
          receivedInventory.inventoryMovements = allocatedInventory.inventoryMovements;
        }
      });
      this.listOfDisplayReceivedInventory = this.listOfAllReceivedInventory;
    });
  }

  confirmPutaway(index: number, receivedInventory: Inventory): void {
    this.isSpinning = true;

    this.inventoryService
      .move(receivedInventory, receivedInventory.inventoryMovements![index].location)
      .subscribe({
        next: (inventory) => {
          this.refreshReceiptResults(1);
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
      }); 
  }
  manualPutaway(receivedInventory: Inventory): void { }
  printReceipt(event: any): void {

    this.isSpinning = true;
    console.log(`start to print receiving document: ${this.currentReceipt.number} `);

    this.receiptService.printReceivingDocument(
      this.currentReceipt, this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "Receiving Document",
          printResult.fileName,
          ReportType.RECEIVING_DOCUMENT,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, 
          PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          this.currentReceipt.number, 
          printResult, event.collated);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }

  // Allow reserve inventory now
  isInventoryReversible(inventory: Inventory): boolean {
    return this.currentReceipt.receiptStatus !== ReceiptStatus.CLOSED;
  }
  // reserve inventory
  reverseInventory(inventory: Inventory, 
    reverseQCQuantity: boolean, allowReuseLPN: boolean): void {
    this.isSpinning = true;
    this.inventoryService.reverseReceivedInventory(inventory, reverseQCQuantity, allowReuseLPN).subscribe({
      next: () => {

        this.loadReceipt(this.currentReceipt.number);
        this.message.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
      }, 
      error: () => {
            
        this.isSpinning = false;
      }

    });
  }

  get lpnControl(): AbstractControl | null {
    return this.receivingForm.get('lpn');
  }

  previewReport(): void {


    this.isSpinning = true;
    console.log(`start to preview ${this.currentReceipt.number}`);
    this.receiptService.printReceivingDocument(this.currentReceipt, this.i18n.currentLang)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }

  openReverseInventoryModal(
    inventory: Inventory,
    tplReverseInventoryModalTitle: TemplateRef<{}>,
    tplReverseInventoryModalContent: TemplateRef<{}>,
  ): void {
    
    this.reverseInventoryForm = this.fb.group({
      lpn: new UntypedFormControl({ value: inventory.lpn, disabled: true }),
      reverseQCQuantity: new UntypedFormControl({ 
        value: inventory.inboundQCRequired === true ? true : false, 
        disabled: inventory.inboundQCRequired === true ? false: true }),
      allowReuseLPN: new UntypedFormControl({ value: false, disabled: false }),
    });

    // Load the location
    this.reverseInventoryModal = this.modalService.create({
      nzTitle: tplReverseInventoryModalTitle,
      nzContent: tplReverseInventoryModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.reverseInventoryModal.destroy();
      },
      nzOnOk: () => {
        this.reverseInventory( 
          inventory,
          this.reverseInventoryForm.controls.reverseQCQuantity.value,
          this.reverseInventoryForm.controls.allowReuseLPN.value,
        );
      },

      nzWidth: 1000,
    });
  }
 
  
  @ViewChild('st', { static: true })
  st!: STComponent;
  receiptLineTableColumns: STColumn[] = [
    {
      title: 'id',
      index: 'id',
      type: 'checkbox'
    },
    { title: this.i18n.fanyi("receipt.line.number"), index: 'number',  iif: () => this.isChoose('number'), width: 150 },    
    { title: this.i18n.fanyi("item"), index: 'item.name',  iif: () => this.isChoose('itemName'), width: 100 , 
            type: "link", click: (record: STData) =>    
                this.router.navigateByUrl(
                  `inventory/item?name=${record["item"]["name"]}`,
                )
    },
        // { title: this.i18n.fanyi("item.description"), index: 'item.description',  iif: () => this.isChoose('itemDescription'), width: 150 },   
    {
      title: this.i18n.fanyi("item.description"), 
      render: 'descriptionColumn',
      iif: () => this.isChoose('itemDescription'), width: 150 
    },    

    { title: this.i18n.fanyi("receipt.line.expectedQuantity"), render: 'expectedQuantityColumn',
        iif: () => this.isChoose('expectedQuantity'), width: 150 },    
    { title: this.i18n.fanyi("receipt.line.receivedQuantity"), render: 'receivedQuantityColumn',
        iif: () => this.isChoose('receivedQuantity'), width: 150 },    
    { title: this.i18n.fanyi("receipt.line.overReceivingQuantity"), index: 'overReceivingQuantity',  iif: () => this.isChoose('overReceivingQuantity'), width: 150 },  
    { title: this.i18n.fanyi("receipt.line.overReceivingPercent"), index: 'overReceivingPercent', iif: () => this.isChoose('overReceivingPercent'), width: 150 },      
    { title: this.i18n.fanyi("qcQuantity"), index: 'qcQuantity', iif: () => this.isChoose('qcQuantity'), width: 150 },      
    { title: this.i18n.fanyi("qcPercentage"), index: 'qcPercentage', iif: () => this.isChoose('qcPercentage'), width: 150 },      
    { title: this.i18n.fanyi("qcQuantityRequested"), index: 'qcQuantityRequested', iif: () => this.isChoose('qcQuantityRequested'), width: 150 },      
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
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
    },    
  ];
  customColumns = [

    { label: this.i18n.fanyi("receipt.line.number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true }, 
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true }, 
    { label: this.i18n.fanyi("receipt.line.expectedQuantity"), value: 'expectedQuantity', checked: true }, 
    { label: this.i18n.fanyi("receipt.line.receivedQuantity"), value: 'receivedQuantity', checked: true }, 
    { label: this.i18n.fanyi("receipt.line.overReceivingQuantity"), value: 'overReceivingQuantity', checked: true }, 
    { label: this.i18n.fanyi("receipt.line.overReceivingPercent"), value: 'overReceivingPercent', checked: true }, 
    { label: this.i18n.fanyi("qcQuantity"), value: 'qcQuantity', checked: true }, 
    { label: this.i18n.fanyi("qcPercentage"), value: 'qcPercentage', checked: true }, 
    { label: this.i18n.fanyi("qcQuantityRequested"), value: 'qcQuantityRequested', checked: true },  
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st != null && this.st.columns != null) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  recalculateQCQuantity(receiptLine: ReceiptLine, qcQuantity?: number, qcPercentage?: number) {

    this.isSpinning = true;
    this.receiptLineService.recalculateQCQuantity(receiptLine, qcQuantity, qcPercentage).subscribe(
      {
        next: () => {
          
          this.message.success(this.i18n.fanyi('message.action.success'));
          this.isSpinning = false;
          this.refreshReceiptResults(); 
        },
        error: () => this.isSpinning = false
      }
    );
  }

  
  processLocationQueryResult(selectedLocationName: any): void {
    // console.log(`start to query with location name ${selectedLocationName}`);
    // this.receivingForm.controls.locationName.setValue(selectedLocationName);
    this.receivingInventoryLocationChanged(selectedLocationName);
  }

  openRecalculateQCModal(
    receiptLine: ReceiptLine,
    tplRecalculateQCModalTitle: TemplateRef<{}>,
    tplRecalculateQCModalContent: TemplateRef<{}>,
  ): void {
    
    this.recalculateQCForm = this.fb.group({
      qcQuantity: new UntypedFormControl({ value: receiptLine.qcQuantity, disabled: true }),
      newQCQuantity: new UntypedFormControl({ value: receiptLine.qcQuantity, disabled: false}),
      qcPercentage: new UntypedFormControl({ value: receiptLine.qcPercentage, disabled: true }),
      newQCPercentage: new UntypedFormControl({ value: receiptLine.qcPercentage, disabled: false }),
    });

    // Load the location
    this.recalculateQCModal = this.modalService.create({
      nzTitle: tplRecalculateQCModalTitle,
      nzContent: tplRecalculateQCModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.recalculateQCModal.destroy();
      },
      nzOnOk: () => {
        this.recalculateQCQuantity( 
          receiptLine,
          this.recalculateQCForm.controls.newQCQuantity.value,
          this.recalculateQCForm.controls.newQCPercentage.value,
        );
      },

      nzWidth: 1000,
    });
  }

  showError(title: string, errorMessage: string): void {
    this.notification.error(
      title, errorMessage,
      { nzPlacement: 'topRight' }
    );
  }

  
  processPutawayLocationQueryResult(selectedLocationName: any): void {
    // console.log(`start to query with location name ${selectedLocationName}`);
    this.currentInventory.locationName = selectedLocationName;
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

  newInventoryItemPackageTypeChanged(itemPackageTypeId: number) {
    console.log(`newInventoryItemPackageTypeChanged: ${itemPackageTypeId}`);
    if (itemPackageTypeId != null) {

      this.itemPackageTypeService.getItemPackageType(itemPackageTypeId).subscribe({
        next: (itemPackageType) => {
          this.currentReceivingInventory!.itemPackageType = itemPackageType;
          if (this.currentReceivingInventory!.itemPackageType) { 
            // show the new item pacakge type details
            this.displayItemPackageType = this.currentReceivingInventory!.itemPackageType;
            if (this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure) {
              // set the display unit of measure
              console.log(`set the display item unit of measure to \n${JSON.stringify(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure)}`);
      
              this.currentReceivingUnitOfMeasure = this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure;
              // this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure.id);
            }
            else if (this.currentReceivingInventory!.itemPackageType.stockItemUnitOfMeasure) {
              // set the display unit of measure
              console.log(`set the display stock item unit of measure to \n${JSON.stringify(this.currentReceivingInventory!.itemPackageType.stockItemUnitOfMeasure)}`);
      
              this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.stockItemUnitOfMeasure.id);
            }
          }
        }, 
        error: () => {
          this.currentReceivingInventory!.itemPackageType = undefined;
        }
      });
    }
    else {
      this.currentReceivingInventory!.itemPackageType = undefined;
      this.displayItemPackageType = undefined;
    }
    
  }
  
  receivingUnitOfMeasureChanged(itemUnitOfMeasureId: number) { 
    this.currentReceivingUnitOfMeasure = 
        this.currentReceivingInventory!.itemPackageType!.itemUnitOfMeasures.find(
          itemUnitOfMeasure => itemUnitOfMeasure.id == itemUnitOfMeasureId
        );
      

  } 
  
  receivingInventoryLocationChanged(locationName: string) {
    if (locationName && locationName.length > 0) {

      this.locationService.getLocations(undefined, undefined, locationName).subscribe({

        next: (locationsRes) => {

          if (locationsRes.length > 0) {
            this.currentReceivingInventory!.location = locationsRes[0];
            this.currentReceivingInventory!.locationId = locationsRes[0].id;
          }
        }
      })
    }

  }

  
  receiptLineItemPackageTypeChange(newItemPackageTypeName: string): void {
    
    const itemPackageTypes = this.currentReceiptLine.item!.itemPackageTypes.filter(
      itemPackageType => itemPackageType.name === newItemPackageTypeName,
    );
    
    this.currentReceiptLine.itemPackageType = undefined;
    this.currentReceiptLine.itemPackageTypeId = undefined;

    if (itemPackageTypes.length === 1) {
      console.log(`found item pacakge type by name ${newItemPackageTypeName}`);

      this.currentReceiptLine.itemPackageType = itemPackageTypes[0];
      this.currentReceiptLine.itemPackageTypeId = itemPackageTypes[0].id;
      this.setupNewItemUnitOfMeasure();
    }
  }
  setupNewItemUnitOfMeasure() {
    console.log(`start to setup the item unit of measure based on current receipt line's item package type ${this.currentReceiptLine.itemPackageType?.name}`)
    if (this.currentReceiptLine && this.currentReceiptLine.itemPackageType) {
      if (this.currentReceiptLine!.itemPackageType.displayItemUnitOfMeasure) {
        // set the display unit of measure
        console.log(`the item package type ${this.currentReceiptLine.itemPackageType?.name} has a display unit of measure defined ${this.currentReceiptLine!.itemPackageType.displayItemUnitOfMeasure.unitOfMeasure?.name}`)
        
        this.currentReceiptLineUnitOfMeasure = this.currentReceiptLine!.itemPackageType.displayItemUnitOfMeasure;
        // this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure.id);
      }
      else if (this.currentReceiptLine!.itemPackageType.stockItemUnitOfMeasure) {
        // set the display unit of measure
        console.log(`defualt the display UOM to the item package type ${this.currentReceiptLine.itemPackageType?.name} 's stock UOM ${this.currentReceiptLine!.itemPackageType.stockItemUnitOfMeasure.unitOfMeasure?.name}`)
        
        this.currentReceiptLineUnitOfMeasure = this.currentReceiptLine!.itemPackageType.stockItemUnitOfMeasure;
      }

    }
  }
  
  receiptLineUnitOfMeasureChanged(itemUnitOfMeasureId: number) { 
    this.currentReceiptLineUnitOfMeasure = 
        this.currentReceiptLine!.itemPackageType!.itemUnitOfMeasures.find(
          itemUnitOfMeasure => itemUnitOfMeasure.id == itemUnitOfMeasureId
        );
      

  } 
  
  receiptLineInventoryStatusChange( ): void {
    const newInventoryStatusName: string = this.currentReceiptLine.inventoryStatus!.name;
    // console.log(`Inventory status name changed to ${JSON.stringify(newInventoryStatusName)}`);
    this.validInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        // console.log(`Inventory status changed to ${JSON.stringify(inventoryStatus)}`);
        this.currentReceiptLine.inventoryStatus = inventoryStatus;
      }
    });
  }
  
}
