import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { ClientService } from '../../common/services/client.service';
import { SupplierService } from '../../common/services/supplier.service';
import { Inventory } from '../../inventory/models/inventory';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure'; 
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { Receipt } from '../models/receipt';
import { ReceiptLine } from '../models/receipt-line';
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
  ) { }
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
      this.searchForm!.controls.client.value).subscribe(
      receiptRes => {

        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: receiptRes.length,
        });
        
        this.refreshDetailInformations(receiptRes);
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
  
  calculateDisplayQuantiies(receipt: Receipt) : void { 
    receipt.receiptLines.forEach(
      receiptLine => {
          this.calculateReceiptLineDisplayQuantity(receiptLine);
      }
    )
  }
  
  calculateReceiptLineDisplayQuantity(receiptLine: ReceiptLine) : void { 
        // console.log(`>> start to calculate the display quantity for receipt line ${receiptLine.number}`)
        // console.log(`>> receiptLine.item? ${receiptLine.item == null}`)
        // console.log(`>> receiptLine.item?.defaultItemPackageType? ${receiptLine.item?.defaultItemPackageType == null}`)
        // console.log(`>> receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure ${receiptLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure == null}`)
        // console.log(`>> receiptLine.item? ${JSON.stringify(receiptLine.item)}`)
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
      title: this.i18n.fanyi("item"), 
      render: 'itemNameColumn', 
    },
    {
      title: this.i18n.fanyi("item.description"), 
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
}
