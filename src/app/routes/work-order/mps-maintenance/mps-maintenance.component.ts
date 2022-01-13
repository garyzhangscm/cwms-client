import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { differenceInCalendarDays, eachDayOfInterval, isEqual, getMonth, isBefore } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

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
import { MasterProductionScheduleLine } from '../models/master-production-schedule-line';
import { MasterProductionScheduleLineDate } from '../models/master-production-schedule-line-date';
import { ProductionLine } from '../models/production-line';
import { WorkOrder } from '../models/work-order';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-mps-maintenance',
  templateUrl: './mps-maintenance.component.html',
  styles: [
    `
      nz-select {
        width: 100%;
      }
      
      .demo-infinite-container {
        height: 300px;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
      }

      nz-list {
        padding: 24px;
      }

      .events {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .events .ant-badge-status {
        overflow: hidden;
        white-space: nowrap;
        width: 100%;
        text-overflow: ellipsis;
        font-size: 12px;
      }
    `
  ]
})
export class WorkOrderMpsMaintenanceComponent implements OnInit {

  currentMPS!: MasterProductionSchedule;
  pageTitle = "";
  isSpinning = false;
  
  // Step 1 - calcuate the required MPS quantity
  isExistingInventorySpinning = false;
  isExistingOrdersSpinning = false;
  isExistingInboundSpinning = false;
  isExistingWorkOrderSpinning = false;
  stepIndex = 0;
  newMPS = true; 
  mpsNumberValidateStatus = 'warning'; 
   
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


  // step 2: setup the MPS on each production line
  isProductionLineSpinning = false;
  availableProductionLines: ProductionLine[] = [];
  selectedProductionLines: ProductionLine[] = [];
  rangeDates:  { [key: number]: any } = {};
  disabledDates:  { [key: number]: (current: Date) => boolean } = {};
  showAddProductionLineMPSModal = false;
  addProductionLineMPSModalMessage = "";
  currentMPSDates: Date[] = []
  addMPSDateModal!: NzModalRef;
  addMPSDateForm!: FormGroup;
  
  constructor(private http: _HttpClient, 
    private fb: FormBuilder,
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
    private productionLineService: ProductionLineService,
    private itemService: ItemService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
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
      plannedQuantity: 0,
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

  initiatePorductionLines() {
    this.isProductionLineSpinning = true;
    this.productionLineService.getAvailableProductionLinesForMPS(this.currentMPS.itemId!).subscribe(
      {
        next: (productionLines) => {
          this.availableProductionLines = productionLines;
          this.isProductionLineSpinning = false;
        },
        error: () => this.isProductionLineSpinning = false
      }
    );
    
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
    // cutoff date needs to be after today
    if (isBefore(result, new Date())) {

      this.messageService.error("cutoff-date-needs-to-be-future");
      

    }
    else {
      this.currentMPS.cutoffDate = result;
    }
  }

  mpsNumberChange(event: Event) {
    
    this.currentMPS!.number = (event.target as HTMLInputElement).value; 
    if (this.currentMPS!.number) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.masterProductionScheduleService.getMasterProductionSchedules(this.currentMPS!.number).subscribe({
        next: (mpsRes) => {
          if (mpsRes.length > 0) {
            // the order is already exists 
            this.mpsNumberValidateStatus = 'numberExists'
          }
        }
      })
      this.mpsNumberValidateStatus = 'success'
    }
    else {
      this.mpsNumberValidateStatus = 'required'
    }
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
          .reduce((sum, current) => sum + current, 0);
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
    if (this.stepIndex === 1) {
      this.initiatePorductionLines();
    }

  }
  readyForNextStep(): boolean {
    if (this.stepIndex === 0) {
      // in first step, we will allow the user to continue only when we got
      // the MPS quantity
      return this.currentMPS.item?.id != null 
          && this.currentMPS.cutoffDate  != null 
          && isBefore(new Date(), this.currentMPS.cutoffDate)
          && this.currentMPS.totalQuantity > 0
          && this.mpsNumberValidateStatus === 'success'
    }
    else if (this.stepIndex === 1) {
      // in the second step, we will allow the user to continue only when 
      // we have some MPS planned
      return this.currentMPS.plannedQuantity != null 
          && this.currentMPS.plannedQuantity > 0; 
    }
    return true;
  }

  onProductionLineSelected() {
    // filter out the schedule line that is not exists any more
    this.currentMPS.masterProductionScheduleLines = 
        this.currentMPS.masterProductionScheduleLines.filter(
          masterProductionScheduleLine => this.selectedProductionLines.some(
            productionLine => productionLine.id === masterProductionScheduleLine.productionLine.id
          )
        );
    //console.log(`productoin line selected: ${JSON.stringify(this.selectedProductionLines)}`)
    this.selectedProductionLines.forEach(
      productionLine => {
        this.rangeDates[productionLine.id!] = null;
        this.disabledDates[productionLine.id!] =  
          (current: Date): boolean => !this.isDateValidForMPS(current, productionLine.id!);

        // if this is a new production line for the MPS, then add it as an MPS line with 0 quantity
        if (!this.currentMPS.masterProductionScheduleLines.some(
          masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLine.id
        )) {
          this.currentMPS.masterProductionScheduleLines = [
            ...this.currentMPS.masterProductionScheduleLines, 
            {              
              quantity: 0,
              productionLine: productionLine,
              masterProductionScheduleLineDates: [], 
            }
          ]
        }

        
      }
    )
  }
  // check if we can setup the MPS on a production line by a specific date
  isDateValidForMPS(current: Date, productionLineId: number) : boolean {
    // past date is not valid for MPS
    if (differenceInCalendarDays(new Date(), current) > 0) {
      return false;
    }
    // date after the cutoff date is not valid
    if (differenceInCalendarDays(this.currentMPS.cutoffDate!, current) < 0) {
      return false;
    }

    return true;
  }

  
  // work order Table
  @ViewChild('tplAddMPSDateModalTitle', { static: false })
  tplAddMPSDateModalTitle!:  TemplateRef<{}>;
  // work order Table
  @ViewChild('tplAddMPSDateModalContent', { static: false })
  tplAddMPSDateModalContent!:  TemplateRef<{}>;

  onRangeDateChange(productionLineId: number): void { 
     
    if (this.rangeDates[productionLineId] != null) {
      
        let startDate : Date = this.rangeDates[productionLineId][0];
        let endDate : Date = this.rangeDates[productionLineId][1]; 
        // we will only proceed if the user choose at least one valid day
        if (differenceInCalendarDays(endDate, startDate) >= 0) {
          let interval: Interval = {
            start: startDate,
            end: endDate
          }
          // get the date in between the start date and end date
          // and skip the date that is not valid for assignment
          // and the date that is already assigned
          this.currentMPSDates = eachDayOfInterval(interval).filter(
            date =>  !this.isDateALreadyAssigned(date, productionLineId) &&
                          this.isDateValidForMPS(date, productionLineId) 
          );
          if (this.currentMPSDates.length == 0) {
            this.messageService.error(this.i18n.fanyi("no-valid-date"));
            return;
          }
          this.addMPSDateForm = this.fb.group({
            dailyQuantity: [null],
          });
                
          // Load the location
          this.addMPSDateModal = this.modalService.create({
            nzTitle: this.tplAddMPSDateModalTitle,
            nzContent: this.tplAddMPSDateModalContent,
            nzOkText: this.i18n.fanyi('confirm'),
            nzCancelText: this.i18n.fanyi('cancel'),
            nzMaskClosable: false,
            nzOnCancel: () => {
              this.addMPSDateModal.destroy();
              // this.refreshReceiptResults();
            },
            nzOnOk: () => {
              if (this.addMPSDateForm.controls.dailyQuantity.value == null ||
                    this.addMPSDateForm.controls.dailyQuantity.value <= 0) {
                      this.messageService.error(this.i18n.fanyi("daily-quantity-is-required"));
                      return false;
              }
              this.addMPSDates(
                productionLineId,
                this.currentMPSDates, 
                this.addMPSDateForm.controls.dailyQuantity.value
              );
              return true;
            },
            nzWidth: 1000,
          });

        }

    }
  } 
 
  addMPSDates(productionLineId: number, mpsDates: Date[], dailyQuantity: number) : void {

    this.currentMPS.masterProductionScheduleLines
        .filter(masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId)
        .forEach(masterProductionScheduleLine => {
          mpsDates.forEach(
            mpsDate => {
              // if the date doesn't exists yet, add it
              if (!masterProductionScheduleLine.masterProductionScheduleLineDates.some(
                masterProductionScheduleLineDate => isEqual(masterProductionScheduleLineDate.date, mpsDate)
              )) {
                masterProductionScheduleLine.masterProductionScheduleLineDates = [
                  ...masterProductionScheduleLine.masterProductionScheduleLineDates, 
                  {                    
                      plannedQuantity: dailyQuantity,
                      date: mpsDate
                  }
                ]
              }
            }
          )
        });
        
    this.refreshCurrentMPSPlannedQuantity();


  }

  refreshCurrentMPSPlannedQuantity() {
    this.currentMPS.plannedQuantity = 0;
    this.currentMPS.masterProductionScheduleLines
    .forEach(masterProductionScheduleLine => {
       masterProductionScheduleLine.quantity = 0;
       masterProductionScheduleLine.masterProductionScheduleLineDates
       .forEach(
        masterProductionScheduleLineDate =>  {
          masterProductionScheduleLine.quantity += masterProductionScheduleLineDate.plannedQuantity
          this.currentMPS.plannedQuantity! += masterProductionScheduleLineDate.plannedQuantity
        }
       )
       
    })
  }
  getMasterProductionScheduleLineDates(productionLineId: number) : MasterProductionScheduleLineDate[]{

    let masterProductionScheduleLineDates: MasterProductionScheduleLineDate[] = [];
    this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId
    ).forEach(
      masterProductionScheduleLine => {
        masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
          masterProductionScheduleLineDate => masterProductionScheduleLineDates = [
            ...masterProductionScheduleLineDates, 
            masterProductionScheduleLineDate
          ]
        )
      }
    );
    return masterProductionScheduleLineDates;
  }
  
  getTotalPlannedQuantityByProductionLine(productionLineId: number) : number{

    let quantity = 0;
    this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId
    ).forEach(
      masterProductionScheduleLine => {
        masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
          masterProductionScheduleLineDate => quantity += masterProductionScheduleLineDate.plannedQuantity
        )
      }
    );
    return quantity;
  }

  isDateALreadyAssigned(date: Date, productionLineId: number): boolean { 
    return this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId
    ).some(
      masterProductionScheduleLine =>  
        masterProductionScheduleLine.masterProductionScheduleLineDates.some(
          masterProductionScheduleLineDate =>  isEqual(masterProductionScheduleLineDate.date, date)
        ) 
    );
  }
  removeDateAssignedment(masterProductionScheduleLineDate: MasterProductionScheduleLineDate
    , productionLineId: number): void {
      this.currentMPS.masterProductionScheduleLines.filter(
        masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId
      ).forEach(
        masterProductionScheduleLine =>  
          masterProductionScheduleLine.masterProductionScheduleLineDates = 
          masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
            existMPSDate => !isEqual(existMPSDate.date, masterProductionScheduleLineDate.date)
          )
      );
    }

  // confirm page
  getDailyPlannedQuantity(masterProductionScheduleLine: MasterProductionScheduleLine, date: Date): number {
    return masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
      masterProductionScheduleLineDate => isEqual(masterProductionScheduleLineDate.date, date)
    )
    .map(masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity)
    .reduce((sum, current) => sum + current, 0);
  }
  getMonthlyPlannedQuantity(masterProductionScheduleLine: MasterProductionScheduleLine, date: Date): number {
    return masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
      masterProductionScheduleLineDate => getMonth(masterProductionScheduleLineDate.date) === getMonth(date)
    )
    .map(masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity)
    .reduce((sum, current) => sum + current, 0);
  }
  
  confirm(): void {
    this.isSpinning = true;
    if (this.newMPS) {
      this.masterProductionScheduleService.addMasterProductionSchedule(this.currentMPS)
          .subscribe({
            next:() => {
              this.messageService.success(this.i18n.fanyi('message.action.success'));
              setTimeout(() => {
                this.isSpinning = false;
                this.router.navigateByUrl(`/work-order/mps?number=${this.currentMPS?.number}`);
              }, 2500);
            },
            error: () => this.isSpinning = false
          })
    }
  }
}
