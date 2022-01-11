import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { Receipt } from '../../inbound/models/receipt';
import { ReceiptLine } from '../../inbound/models/receipt-line';
import { ReceiptLineService } from '../../inbound/services/receipt-line.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemService } from '../../inventory/services/item.service';
import { Order } from '../../outbound/models/order';
import { OrderLine } from '../../outbound/models/order-line';
import { OrderLineService } from '../../outbound/services/order-line.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MasterProductionSchedule } from '../models/master-production-schedule';
import { WorkOrder } from '../models/work-order';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-mps-maintenance',
  templateUrl: './mps-maintenance.component.html',
})
export class WorkOrderMpsMaintenanceComponent implements OnInit {

  currentMPS!: MasterProductionSchedule;
  pageTitle = "";
  isSpinning = false;
  isExistingInventorySpinning = false;
  isExistingOrdersSpinning = false;
  isExistingInboundSpinning = false;
  isExistingWorkOrderSpinning = false;
  stepIndex = 0;
  newMPS = true; 

   
  existingInventoryQuantity = 0;
  existingOrderQuantity = 0;
  expectedOrderQuantity = 0;
  existingInboundQuantity = 0;
  expectedInboundQuantity = 0;
  existingWorkOrderQuantity = 0;
  expectedWorkOrderQuantity = 0;
  
  filterByExistingInventoryQuantity = false;
  filterByExistingOrderQuantity = false;
  filterByExpectedOrderQuantity = false;
  filterByExistingInboundQuantity = false;
  filterByExpectedInboundQuantity = false;
  filterByExistingWorkOrderQuantity = false;
  filterByExpectedWorkOrderQuantity = false;

  inventoryList: Inventory[] = [];
  orderLineList: OrderLine[] = [];
  receiptLineList: ReceiptLine[] = []
  workOrderList: WorkOrder[] = [];

  
  constructor(private http: _HttpClient, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private masterProductionScheduleService: MasterProductionScheduleService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private orderLineService: OrderLineService,
    private receiptLineService: ReceiptLineService,
    private workOrderService: WorkOrderService,
    private itemService: ItemService,
    ) { 
      this.pageTitle = this.i18n.fanyi('MPS');
    this.currentMPS = {        
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      number: "",
      description: "",      
      
      item: {         
        name: "",
        description: "",        
        itemPackageTypes: []         
      },      
      totalQuantity: 0,
      masterProductionScheduleLines: []
    }
  }

  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.masterProductionScheduleService.getMasterProductionSchedule(params.id)
          .subscribe(mpsRes => {
            this.currentMPS = mpsRes;

            this.newMPS = false;
            
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine(); 
        this.newMPS = true;
      }
    });
   }

   
  itemNameChanged(event: Event) {
    const itemName = (event.target as HTMLInputElement).value.trim();
    if (itemName.length > 0) {

      this.itemService.getItems(itemName).subscribe(
        {
          next: (itemsRes) => {
            if (itemsRes.length === 1) { 
              this.currentMPS.item = itemsRes[0];
              this.currentMPS.itemId = itemsRes[0].id!;
            }
          }
        }
      )
    }
  }
  

  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length === 1) {
            this.currentMPS.item = itemsRes[0];
            this.currentMPS.itemId = itemsRes[0].id!;
          }
        }
      }
    )
    
  }


  refreshTotalQuantity() {
    this.currentMPS.totalQuantity = this.getSuggestedTotalQuantity();
  }

  getSuggestedTotalQuantity() : number{
    return Math.max(
            0, 
            (this.existingOrderQuantity + this.expectedOrderQuantity) - // required
                this.existingInventoryQuantity -    // on hand
                (this.existingInboundQuantity + this.expectedInboundQuantity) -    //   inbound
                (this.existingInboundQuantity + this.expectedInboundQuantity)    // work order receiving
          
          );
  }

  filterByExistingInventoryQuantityChanged() {
    if (this.filterByExistingInventoryQuantity) {

      this.loadExistingInventoryForMPS();
    }
    else {
      // we will not consider the existing inventory
      this.existingInventoryQuantity = 0;

    }
  }
 
  loadExistingInventoryForMPS() {
    this.isExistingInventorySpinning = true;

    this.inventoryService.getAvailableInventoryForMPS(
      this.currentMPS.item?.id, undefined
    ).subscribe({
      next: (inventoryRes) => {

        this.inventoryList = inventoryRes;
        this.isExistingInventorySpinning = false;
      }, 
      error: () => {
        this.inventoryList = [];
        this.isExistingInventorySpinning = false;

      }
    })

  }
  
  filterByExistingOrderQuantityChanged() {
    if (this.filterByExistingOrderQuantity) {

      this.loadExistingOrderLineForMPS();
    }
    else {
      // we will not consider the existing inventory
      this.existingOrderQuantity = 0;

    }
  }
 
  loadExistingOrderLineForMPS() {
    this.isExistingOrdersSpinning = true;

    this.orderLineService.getAvailableOrderLinesForMPS(
      this.currentMPS.item?.id!
    ).subscribe({
      next: (orderLineRes) => {

        this.orderLineList = orderLineRes;
        this.isExistingOrdersSpinning = false;
      }, 
      error: () => {
        this.orderLineList = [];
        this.isExistingOrdersSpinning = false;

      }
    })

  }
  
  filterByExpectedOrderQuantityChanged() {
    if (!this.filterByExpectedOrderQuantity) {

      this.expectedOrderQuantity = 0;
    }
    
  }

  
  filterByExistingInboundQuantityChanged() {
    if (this.filterByExistingInboundQuantity) {

      this.loadExistingReceiptLineForMPS();
    }
    else {
      // we will not consider the existing inventory
      this.existingInboundQuantity = 0;

    }
  }
 
  loadExistingReceiptLineForMPS() {
    this.isExistingInboundSpinning = true;

    this.receiptLineService.getAvailableReceiptLinesForMPS(
      this.currentMPS.item?.id!
    ).subscribe({
      next: (receiptLineRes) => {

        this.receiptLineList = receiptLineRes;
        this.isExistingInboundSpinning = false;
      }, 
      error: () => {
        this.receiptLineList = [];
        this.isExistingInboundSpinning = false;

      }
    })

  }

  filterByExpectedInboundQuantityChanged() {
    if (!this.filterByExpectedInboundQuantity) {

      this.expectedInboundQuantity = 0;
    }
    
  }
  
  filterByExistingWorkOrderQuantityChanged() {
    if (this.filterByExistingWorkOrderQuantity) {

      this.loadExistingWorkOrderForMPS();
    }
    else {
      // we will not consider the existing inventory
      this.existingWorkOrderQuantity = 0;

    }
  }
 
  loadExistingWorkOrderForMPS() {
    this.isExistingWorkOrderSpinning = true;

    this.workOrderService.getAvailableWorkOrderForMPS(
      this.currentMPS.item?.id!
    ).subscribe({
      next: (workOrderRes) => {

        this.workOrderList = workOrderRes;
        this.isExistingWorkOrderSpinning = false;
      }, 
      error: () => {
        this.workOrderList = [];
        this.isExistingWorkOrderSpinning = false;

      }
    })

  }
  filterByExpectedWorkOrderQuantityChanged() {
    if (!this.filterByExpectedWorkOrderQuantity) {

      this.expectedWorkOrderQuantity = 0;
    }
    
  }

  cutoffDateChanged(result: Date): void {
    console.log('onChange: ', result);
  }

  // Inventory Table
  @ViewChild('inventoryTable', { static: false })
  inventoryTable!: STComponent;
  inventoryTableColumns: STColumn[] = [
    
    { title: '', index: 'id', type: 'checkbox' }, 
    { title: this.i18n.fanyi("lpn"), index: 'lpn',}, 
    { title: this.i18n.fanyi("item"), index: 'item.name', },
    { title: this.i18n.fanyi("item.description"), index: 'item.description', },
    { title: this.i18n.fanyi("quantity"), index: 'quantity',  }, 
    { title: this.i18n.fanyi("location-group"), index: 'location.locationGroup.name',  }, 
    { title: this.i18n.fanyi("location"), index: 'location.name',  }, 
   
  ]; 
  
  inventoryTableChanged(event: STChange) : void { 
    console.log(`event.type: ${event.type}`);

    if (event.type === 'checkbox') {
      
      const dataList: STData[] = this.inventoryTable.list;
      this.existingInventoryQuantity =
          dataList
          .filter( data => data.checked)
          .map(data => data["quantity"])
          .reduce((sum, current) => sum + current, 0);;
    } 

  }
  
  // Order Line Table
  @ViewChild('orderLineTable', { static: false })
  orderLineTable!: STComponent;
  orderLineTableColumns: STColumn[] = [
    
    { title: '', index: 'id', type: 'checkbox' }, 
    { title: this.i18n.fanyi("order.number"), index: 'orderNumber',}, 
    { title: this.i18n.fanyi("item"), index: 'item.name', },
    { title: this.i18n.fanyi("item.description"), index: 'item.description', },
    { title: this.i18n.fanyi("order.line.expectedQuantity"), index: 'expectedQuantity',  }, 
    { title: this.i18n.fanyi("order.line.openQuantity"), index: 'openQuantity',  }, 
    { title: this.i18n.fanyi("order.line.inprocessQuantity"), index: 'inprocessQuantity',  }, 
    { title: this.i18n.fanyi("order.line.shippedQuantity"), index: 'shippedQuantity',  },  
   
  ]; 
  
  orderLineTableChanged(event: STChange) : void { 
    console.log(`event.type: ${event.type}`);

    if (event.type === 'checkbox') {
      
      const dataList: STData[] = this.orderLineTable.list;
      this.existingOrderQuantity =
          dataList
          .filter( data => data.checked)
          .map(data => data["openQuantity"])
          .reduce((sum, current) => sum + current, 0);;
    } 

  }
  
  // Receipt Line Table
  @ViewChild('receiptLineTable', { static: false })
  receiptLineTable!: STComponent;
  receiptLineTableColumns: STColumn[] = [
    
    { title: '', index: 'id', type: 'checkbox' }, 
    { title: this.i18n.fanyi("receipt.number"), index: 'receiptNumber',}, 
    { title: this.i18n.fanyi("item"), index: 'item.name', },
    { title: this.i18n.fanyi("item.description"), index: 'item.description', },
    { title: this.i18n.fanyi("receipt.line.expectedQuantity"), index: 'expectedQuantity'  },    
    { title: this.i18n.fanyi("receipt.line.receivedQuantity"), index: 'receivedQuantity' },    
    
   
  ]; 
  
  receiptLineTableChanged(event: STChange) : void {  

    if (event.type === 'checkbox') {
      
      const dataList: STData[] = this.receiptLineTable.list;
      this.existingInboundQuantity =
          dataList
          .filter( data => data.checked)
          .map(data => data["expectedQuantity"] - data["receivedQuantity"] )
          .reduce((sum, current) => sum + current, 0);
    } 

  }
  // work order Table
  @ViewChild('workOrderTable', { static: false })
  workOrderTable!: STComponent;
  workOrderTableColumns: STColumn[] = [
    
    { title: '', index: 'id', type: 'checkbox' }, 
    { title: this.i18n.fanyi("work-order.number"), index: 'number',}, 
    { title: this.i18n.fanyi("item"), index: 'item.name', },
    { title: this.i18n.fanyi("item.description"), index: 'item.description', },
    { title: this.i18n.fanyi("work-order.expected-quantity"), index: 'expectedQuantity'  },    
    { title: this.i18n.fanyi("work-order.produced-quantity"), index: 'producedQuantity' },    
    
   
  ]; 
  
  workOrderTableChanged(event: STChange) : void {  

    if (event.type === 'checkbox') {
      
      const dataList: STData[] = this.workOrderTable.list;
      this.existingWorkOrderQuantity =
          dataList
          .filter( data => data.checked)
          .map(data => data["expectedQuantity"] - data["producedQuantity"] )
          .reduce((sum, current) => sum + current, 0);
    } 

  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }
  readyForNextStep(): boolean {
    if (this.stepIndex === 0) {
      // in step 1, we will allow the user to continue only when we got
      // the MPS quantity
      return this.currentMPS.item?.id != null 
          && this.currentMPS.cutoffDate  != null 
          && this.currentMPS.totalQuantity > 0
    }
    else {
      return true;
    }
  }

  confirm(): void {}
}
