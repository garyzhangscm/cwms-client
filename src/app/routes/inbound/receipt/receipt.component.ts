import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
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
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure'; 
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

@Component({
  selector: 'app-inbound-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.less'],
})
export class InboundReceiptComponent implements OnInit {
  listOfColumns: Array<ColumnItem<Receipt>> = [
    {
      name: 'receipt.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => a.number.localeCompare(b.number),
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
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'supplier',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableObjField(a.supplier, b.supplier, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, 
    {
      name: 'status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => a.receiptStatus.localeCompare(b.receiptStatus),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalLineCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalLineCount, b.totalLineCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalItemCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalExpectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalExpectedQuantity, b.totalExpectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.totalReceivedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Receipt, b: Receipt) => this.utilService.compareNullableNumber(a.totalReceivedQuantity, b.totalReceivedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
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
  expandSet = new Set<number>();

  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  isSpinning = false;
  isReceivedInventorySpinning = false;
  validSuppliers: Supplier[] = [];

  receiptStatus = ReceiptStatus;

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllReceipts: Receipt[] = [];
  listOfDisplayReceipts: Receipt[] = [];
  receiptStatusList = ReceiptStatus;

  threePartyLogisticsFlag = false;
  loadingOrderDetailsRequest = 0;
  
  availableClients: Client[] = []; 

  
  listOfAllReceivedInventory: { [receiptNumber: string]: Inventory[] } = {};

  billableActivityReceipt?: Receipt;
  billableActivityReceiptLine?: ReceiptLine; 
  allBillableActivityTypes: BillableActivityType[] = [];
  availableBillableActivityTypes: BillableActivityType[] = [];

  billableActivityModal!: NzModalRef; 
  billableActivityForm!: UntypedFormGroup;
  addActivityInProcess = false;


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
  ]);

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private receiptService: ReceiptService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
    private supplierService: SupplierService,
    private clientService: ClientService,
    private warehouseService: WarehouseService,
    private billableActivityTypeService: BillableActivityTypeService,
    private userService: UserService
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
  }
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inbound.receipt'));
    // initiate the search form
    this.searchForm = this.fb.group({
      client: [null],
      number: [null],
      statusList: [null],
      supplier: [null],
      checkInDateTimeRanger: [null],
      checkInDate: [null],
    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm!.controls.number.setValue(params.number);
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

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllReceipts = [];
    this.listOfDisplayReceipts = [];

  }

  search(): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';

    
    let checkInStartTime : Date = this.searchForm.controls.checkInDateTimeRanger.value ? 
        this.searchForm.controls.checkInDateTimeRanger.value[0] : undefined; 
    let checkInEndTime : Date = this.searchForm.controls.checkInDateTimeRanger.value ? 
        this.searchForm.controls.checkInDateTimeRanger.value[1] : undefined; 
    let checkInSpecificDate : Date = this.searchForm.controls.checkInDate.value;

    this.receiptService.getReceipts(this.searchForm!.controls.number.value, true,       
      this.searchForm!.controls.statusList.value,       
      this.searchForm!.controls.supplier.value,
      checkInStartTime, checkInEndTime, checkInSpecificDate, 
         undefined,
         undefined,
      this.searchForm!.controls.client.value).subscribe(
      receiptRes => {

        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: receiptRes.length,
        });
        
        this.refreshDetailInformations(receiptRes);
        // sum up the line's billable activity and save it to the receipt level
        // for easy display
        this.setupReceiptBillableActivities(receiptRes);
        
        this.listOfAllReceipts = this.calculateQuantities(receiptRes);
        this.listOfDisplayReceipts = this.calculateQuantities(receiptRes);

      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
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

            this.calculateReceiptLineDisplayQuantity(receiptLine);
            this.loadingOrderDetailsRequest--;
          }
        }
      );
    }
    else if (receiptLine.item != null) {
      // console.log(`item is not null:\n${JSON.stringify(receiptLine.item)}`)
      this.calculateReceiptLineDisplayQuantity(receiptLine);
    }
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
    this.listOfDisplayReceipts!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Receipt[]): void {
    this.listOfDisplayReceipts! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayReceipts!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayReceipts!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
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
    const selectedReceipts: Receipt[] = [];
    this.listOfAllReceipts.forEach((receipt: Receipt) => {
      if (this.setOfCheckedId.has(receipt.id!)) {
        selectedReceipts.push(receipt);
      }
    });
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
  
  onExpandChange(receipt: Receipt, checked: boolean): void { 
    console.log(`expanded for receipt ${receipt.number}, expanded? ${checked} `)
    if (checked) {
      this.expandSet.add(receipt.id!);
      this.loadItems(receipt);
      this.loadReceivedInventory(receipt);
      
    } else {
      this.expandSet.delete(receipt.id!);
    }


  }
  @ViewChild('st', { static: false })
  st!: STComponent;
  receiptLineTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("receipt.line.number"), index: 'number', width: 150 },    
    {
      title: this.i18n.fanyi("item"), width: 150, 
      render: 'itemNameColumn', 
    },
    {
      title: this.i18n.fanyi("item.description"), width: 150, 
      render: 'itemDescriptionColumn', 
    }, 
    { title: this.i18n.fanyi("receipt.line.expectedQuantity"), 
    
        render: 'expectedQuantityColumn',  width: 150 },     
    { title: this.i18n.fanyi("receipt.line.receivedQuantity"),  render: 'receivedQuantityColumn',  width: 150 },    
    { title: this.i18n.fanyi("receipt.line.overReceivingQuantity"), index: 'overReceivingQuantity' , width: 150 },  
    { title: this.i18n.fanyi("receipt.line.overReceivingPercent"), index: 'overReceivingPercent' , width: 150 },      
    { title: this.i18n.fanyi("qcQuantity"), index: 'qcQuantity' , width: 150 },      
    { title: this.i18n.fanyi("qcPercentage"), index: 'qcPercentage' , width: 150 },      
    { title: this.i18n.fanyi("qcQuantityRequested"), index: 'qcQuantityRequested' , width: 150 },     
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn', 
      width: 250,
      fixed: 'right',
      iif: () => !this.displayOnly

    },   
  ];
 
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

  @ViewChild('stInventory', { static: false })
  stInventory!: STComponent;
  receivedInventoryTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("lpn"), index: 'lpn', width: 150 },    
    {
      title: this.i18n.fanyi("item"), index: 'item.name' ,  width: 150,
    },
    {
      title: this.i18n.fanyi("item.description"),  index: 'item.description' ,  width: 150,
    }, 
    { title: this.i18n.fanyi("quantity"), 
    
        render: 'quantityColumn',  width: 150 },     
    { title: this.i18n.fanyi("inventory.status"),  index: 'inventoryStatus.name' ,  width: 150 },   
    { title: this.i18n.fanyi("color"), index: 'color' , width: 150 },       
    { title: this.i18n.fanyi("productSize"), index: 'productSize' , width: 150 },       
    { title: this.i18n.fanyi("style"), index: 'style' , width: 150 },        
    { title: this.i18n.fanyi("location"), index: 'location.name' , width: 150 },       
    { title: this.i18n.fanyi("nextLocation"), 
    render: 'nextLocationColumn',  width: 150 },       
    // { title: this.i18n.fanyi("action"), render: 'actionColumn', width: 150 },       
  ];


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
      console.log(`start to remove receipt line billable activity`);

      this.receiptService.removeReceiptLineBillableActivity(
        receiptLine.id!, receiptLineBillableActivity.id!
      ).subscribe({
        next: () => {
          
          this.isSpinning = false;
          
          receiptLine.receiptLineBillableActivities = receiptLine.receiptLineBillableActivities.filter(
            existingReceiptLineBillableActivity => existingReceiptLineBillableActivity.id != receiptLineBillableActivity.id
          );
          // this.searchForm!.controls.number.setValue(this.billableActivityReceipt!.number);
          // this.search();
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


    this.billableActivityForm = this.fb.group({ 
      billableActivityType: ['', Validators.required],
      activityTime:  ['', Validators.required],
      rate: [''],
      amount: [''],
      totalCharge: ['', Validators.required],
    });

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
          billableActivityTypeId: this.billableActivityForm.controls.billableActivityType.value,
          activityTime: this.billableActivityForm.controls.activityTime.value,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          clientId:  this.billableActivityReceipt?.clientId,
          rate: this.billableActivityForm.controls.rate.value,
          amount: this.billableActivityForm.controls.amount.value,
          totalCharge: this.billableActivityForm.controls.totalCharge.value,
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
          billableActivityTypeId: this.billableActivityForm.controls.billableActivityType.value,
          activityTime: this.billableActivityForm.controls.activityTime.value,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          clientId:  this.billableActivityReceipt?.clientId,
          rate: this.billableActivityForm.controls.rate.value,
          amount: this.billableActivityForm.controls.amount.value,
          totalCharge: this.billableActivityForm.controls.totalCharge.value,
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
    
    if (this.billableActivityForm.controls.rate.value != null &&
      this.billableActivityForm.controls.amount.value != null) {

        this.billableActivityForm!.controls.totalCharge.setValue(
          this.billableActivityForm.controls.rate.value * 
          this.billableActivityForm.controls.amount.value
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


}
