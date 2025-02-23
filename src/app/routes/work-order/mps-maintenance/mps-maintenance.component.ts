import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { differenceInCalendarDays, eachDayOfInterval, isEqual, getMonth, isBefore, parseISO, addDays } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
 
import { ReceiptLine } from '../../inbound/models/receipt-line';
import { ReceiptLineService } from '../../inbound/services/receipt-line.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemService } from '../../inventory/services/item.service'; 
import { OrderLine } from '../../outbound/models/order-line';
import { OrderLineService } from '../../outbound/services/order-line.service'; 
import { ColorService } from '../../util/services/color.service'; 
import { CompanyService } from '../../warehouse-layout/services/company.service';
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
      .color-box {
        
        width: 15px;
        height: 15px;
        display: inline-block;
        
        left: 5px;
        top: 5px;
      }
      .border {
        border: 1px solid #1890ff;
        border-radius: 50%;
      }
    `
    ],
    standalone: false
})
export class WorkOrderMpsMaintenanceComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN); 
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
  // dates that already assigned by some existing MPS
  // key: production line id - date
  // value: MPS number
  existingMPSs:  { [key: string]: MasterProductionSchedule } = {}; 
  // MPSs that already assigned to the production line
  // key: production line id
  // value: MPS number
  existingMPSNumbers:  { [key: string]: Set<string> } = {}; 
  // background of the calendar cell for each MPS & production line
  // key: production line id - MPS number
  // value: color value in Hex  
  existingMPSColors:  { [key: string]: string } = {}; 
  modifyMPSDateOption: string = "remove";
  modifiedMPSDateValid: boolean = true;
  modifiedMPSDateBeyondCutoffDate: boolean = false;
  modifiedMPSDateOverlapWithOthers: boolean = false;
  modifiedMPSProductionLineId?: number;
  isModifiedMPSDateModalSpinning = false;
  
  colors = [this.colorService.Red, 
    this.colorService.Orange,
    this.colorService.Yellow,
    this.colorService.Purple,
    this.colorService.Green,
    this.colorService.Blue,
    this.colorService.Brown];

  showAddProductionLineMPSModal = false;
  addProductionLineMPSModalMessage = "";
  currentMPSDates: Date[] = []
  currentMPSInterval?: Interval;
  newMPSInterval?: Interval;

  addMPSDateModal!: NzModalRef;
  addMPSDateForm!: UntypedFormGroup;
  modifyMPSDateModal!: NzModalRef;
  modifyMPSDateForm!: UntypedFormGroup;

  // confirm
  // see if we will need to move the successor
  // when we chagne the current MPS
  // if current mps is overlapping with other MPS, then
  // move successor is force to be true
  // if the user is changing a existing MPS and modified
  // the last date of the MPS, then the user can choose
  // to move successor accordingly, or not
  moveSuccessor: boolean = true;
  originalMPSLastDate: Date|undefined = undefined;
  
  constructor(private http: _HttpClient, 
    private fb: UntypedFormBuilder,
    private titleService: TitleService,
    private masterProductionScheduleService: MasterProductionScheduleService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private orderLineService: OrderLineService,
    private receiptLineService: ReceiptLineService,
    private workOrderService: WorkOrderService,
    private productionLineService: ProductionLineService,
    private itemService: ItemService,
    private modalService: NzModalService,
    private messageService: NzMessageService, 
    private colorService: ColorService,
    ) { 
      this.pageTitle = this.i18n.fanyi('MPS');
    this.currentMPS = {        
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      number: "",
      description: "",      
      
      item: {         
        name: "",
        description: "",        
        itemPackageTypes: [], 
        companyId: this.companyService.getCurrentCompany()!.id      
      },      
      totalQuantity: 0,
      plannedQuantity: 0,
      masterProductionScheduleLines: []
    }
  }

  ngOnInit(): void {

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        // Get the production line by ID
        this.masterProductionScheduleService.getMasterProductionSchedule(params['id'])
          .subscribe(mpsRes => {
            this.currentMPS = mpsRes;
            // we may need to parse all the date before we can continue
            this.currentMPS.cutoffDate = parseISO(this.currentMPS.cutoffDate!.toString().substring(0, 10));
            this.currentMPS.masterProductionScheduleLines.forEach(
              masterProductionScheduleLine => {
                masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
                  masterProductionScheduleLineDate => 
                    masterProductionScheduleLineDate.plannedDate = 
                        parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10))
                );
              }
            )

            this.newMPS = false;
            this.mpsNumberValidateStatus = 'success';

            
            // save the last date of the current MPS. we will check if we changed the last
            // date of the MPS. If so, then we will check if we will need to move the successor MPS 
            this.currentMPS.masterProductionScheduleLines
            .forEach(
              masterProductionScheduleLine => 
                  masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
                    masterProductionScheduleLineDate => {
                        if (this.originalMPSLastDate == null || 
                          differenceInCalendarDays(this.originalMPSLastDate, masterProductionScheduleLineDate.plannedDate) < 0) {
                            this.originalMPSLastDate = masterProductionScheduleLineDate.plannedDate
                        }
                      }
                  )
            )
              
            
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
          // add the production lines that already assigned to the MPS
          this.selectedProductionLines = this.availableProductionLines.filter(
            productionLine => 
              this.currentMPS.masterProductionScheduleLines.some(
                masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLine.id
              )
          );
          /**
           * 
          this.currentMPS.masterProductionScheduleLines.forEach(
            masterProductionScheduleLine => {
              this.selectedProductionLines = [
                ...this.selectedProductionLines, 
                masterProductionScheduleLine.productionLine
              ]
            }
          )
           */
          this.onProductionLineSelected();
          
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
    // console.log(`start to query with item name ${selectedItemName}`);
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
    // console.log(`event.type: ${event.type}`);

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
    // console.log(`event.type: ${event.type}`);

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
          && differenceInCalendarDays(this.currentMPS.cutoffDate!, new Date()) > 0
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
    
    this.selectedProductionLines.forEach(
      productionLine => {
         
        this.rangeDates[productionLine.id!] = null;
        this.disabledDates[productionLine.id!] =  
          (current: Date): boolean => !this.isDateValidForMPS(current);

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
        this.loadExistingMPSs(productionLine.id!);

        
      }
    )
  }
  

  // load existing MPSs, dated from today until the cutoff date
  // so that we can know which dates of the production line is 
  // not available
  loadExistingMPSs(productionLineId: number) {

    // console.log(`loadExistingMPSs by production line id: ${productionLineId}, with cutoff date ${this.currentMPS.cutoffDate!}`);
    this.isProductionLineSpinning = true;
    this.existingMPSNumbers[productionLineId] = new Set(); 
    this.masterProductionScheduleService.getExistingMPSs(productionLineId, 
      new Date(), this.currentMPS.cutoffDate!).subscribe(
        {
          next: (mpsRes) => {
            // console.log(`start to process existing MPS with length ${mpsRes.length}`);
            
            // skip the current MPS
            mpsRes.filter(mps => mps.number !== this.currentMPS.number)
            .forEach(
              (mps, index) => {
                this.existingMPSNumbers[productionLineId].add(mps.number); 
                // setup the date for each production line and mps
                mps.masterProductionScheduleLines.filter(
                  masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId
                )
                .forEach(
                  masterProductionScheduleLine => {
                    // get the date in between today and cutoff day as those are the only date we are care about
                    // when plan for a new MPS
                    masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
                      masterProductionScheduleLineDate => 
                              differenceInCalendarDays(
                                  parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10)), new Date()) >= 0 &&
                              differenceInCalendarDays(
                                   parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10)),  this.currentMPS.cutoffDate!) <= 0 
                       
                    )
                    .forEach(
                      masterProductionScheduleLineDate => {
                        const plannedDate = parseISO(masterProductionScheduleLineDate.plannedDate.toString().substring(0, 10));
                        const key = `${productionLineId  }-${ 
                            plannedDate.getFullYear().toString()  }-${ 
                            plannedDate.getMonth().toString()  }-${ 
                            plannedDate.getDate().toString()}`;

                            
                        this.existingMPSs[key] = mps;
                      }
                    )


                  }
                )

                // setup the color for each production line and mps
                const color = this.colors[index % this.colors.length];
                
                // key: production line id - MPS number
                // value: color value in Hex  
                const key = `${productionLineId  }-${  mps.number}`;
                this.existingMPSColors[key] = color;


              }
            );
            this.isProductionLineSpinning = false;
          }, 
          error: () => this.isProductionLineSpinning = false
        }
      )

  }
  // check if we can setup the MPS on a production line by a specific date
  isDateValidForMPS(current: Date) : boolean {
    // past date is not valid for MPS
    if (differenceInCalendarDays(new Date(), current) > 0) {
      return false;
    }
    // date after the cutoff date is not valid
    if (differenceInCalendarDays( this.currentMPS.cutoffDate!, current) < 0) {
      return false;
    }

    return true;
  }

  
  // add MPS Date Modal
  @ViewChild('tplAddMPSDateModalTitle', { static: false })
  tplAddMPSDateModalTitle!:  TemplateRef<{}>; 
  @ViewChild('tplAddMPSDateModalContent', { static: false })
  tplAddMPSDateModalContent!:  TemplateRef<{}>;
  
  // modify MPS Date Modal
  @ViewChild('tplModifyMPSDateModalTitle', { static: false })
  tplModifyMPSDateModalTitle!:  TemplateRef<{}>; 
  @ViewChild('tplModifyMPSDateModalContent', { static: false })
  tplModifyMPSDateModalContent!:  TemplateRef<{}>;

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
          
          // if all the date selected are assigned to the current MPS, then
          // we will show the modification modal to allow the user either to
          // cancel the dates, or to move the date forward or backward
          if (eachDayOfInterval(interval).every(
            date => this.isDateALreadyAssignedToCurrentMPS(date, productionLineId))) {
              // every date in the current range is assigned to the current MPS, 
              // then show the modification page so the user can change the current assignment
            this.showModifyMPSDateModal(productionLineId, interval);
          }
          else {

            // get the date in between the start date and end date
            // and skip the date that is not valid for assignment
            // and the date that is already assigned
            this.currentMPSDates = eachDayOfInterval(interval).filter(
              date =>  !this.isDateALreadyAssignedToCurrentMPS(date, productionLineId) &&
                          !this.getExistingMPS(date, productionLineId) &&
                            this.isDateValidForMPS(date) 
            );
            if (this.currentMPSDates.length == 0) {
              this.messageService.error(this.i18n.fanyi("no-valid-date"));
              return;
            }
            this.showAddMPSDateModal(productionLineId);
          }
          

        }

    }
  } 
  
  showModifyMPSDateModal(productionLineId: number, interval: Interval) {
    this.modifyMPSDateForm = this.fb.group({
      movedDays: new UntypedFormControl({ value: 0, disabled: false }),
      extendedDays: new UntypedFormControl({ value: 0, disabled: false }),
      moveSuccessor: new UntypedFormControl({ value: true, disabled: false }),
      moveCutoffDate: new UntypedFormControl({ value: true, disabled: false }),
    });

    
    //initiate the variable we will use in the modify MPS date modal
    this.modifyMPSDateOption = "remove";
    this.modifiedMPSDateValid = true;    
    this.modifiedMPSDateBeyondCutoffDate = false;
    this.modifiedMPSDateOverlapWithOthers = false;
    this.currentMPSInterval = interval;
    this.newMPSInterval = interval;
    this.modifiedMPSProductionLineId = productionLineId;

          
    // Load the location
    this.modifyMPSDateModal = this.modalService.create({
      nzTitle: this.tplModifyMPSDateModalTitle,
      nzContent: this.tplModifyMPSDateModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.modifyMPSDateModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        if (this.modifyMPSDateOption === 'remove') {

          this.removeMPSDates(
            productionLineId,
            this.currentMPSInterval!, 
            this.modifyMPSDateForm.value.moveSuccessor
          );
        }
        else {
          // validate the new interval

          // if the new interval is beyond the cutoff date, make sure
          // the user choose to move the cutoff date accordingly as well
          if (this.modifiedMPSDateBeyondCutoffDate) {
            if (this.modifyMPSDateForm.value.moveCutoffDate === true) {
              // the new interval exceed the cutoff date but the user choose to move
              // the cutoff date accordingly
              this.currentMPS.cutoffDate = this.newMPSInterval!.end as Date;
            }
            else {

              this.messageService.error(this.i18n.fanyi("new-mps-date-interval-beyond-cutoff-date`"));
              // this.messageService.error(this.i18n.fanyi("new-mps-date-interval-not-valid`"));
              return false;
            }
          } 
          else if (this.modifiedMPSDateOverlapWithOthers) {
            // when the new interval overlap with other MPSs, make sure the use choose
            // the "move successor mps" as well
            if (this.modifyMPSDateForm.value.moveSuccessor !== true) {
              
              this.messageService.error(this.i18n.fanyi("new-mps-date-interval-overlap-with-other-mps"));
              // this.messageService.error(this.i18n.fanyi("new-mps-date-interval-not-valid`"));
              return false;
            }
            else {
              // overlapping, let's force to move the successor
              this.moveSuccessor = true;
            }
          }

          console.log(`start to modify the MPS dates`);
          this.modifyMPSDates(
            productionLineId,
            this.currentMPSInterval!, 
            this.newMPSInterval!,
            this.modifyMPSDateForm.value.moveSuccessor
          );
        }
        return true;
      },
      nzWidth: 1000,
    });
  }

  removeMPSDates(productionLineId: number, currentInterval: Interval, moveSuccessor: boolean) {

    // remove the dates
    this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId)
    .forEach(
      masterProductionScheduleLine => 
          masterProductionScheduleLine.masterProductionScheduleLineDates = 
              masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
                    masterProductionScheduleLineDate =>  
                        differenceInCalendarDays(masterProductionScheduleLineDate.plannedDate, currentInterval.start) < 0 ||
                        differenceInCalendarDays(masterProductionScheduleLineDate.plannedDate, currentInterval.end) > 0 

              )
    )
    // clear the selction
    
    this.rangeDates[productionLineId] = null;

    
    // see if we are chaging the last date of the current MPS  
    let newMPSLastDate: Date | undefined = undefined;
    this.currentMPS.masterProductionScheduleLines
    .forEach(
      masterProductionScheduleLine => 
          masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
            masterProductionScheduleLineDate => {
                if (newMPSLastDate == null || 
                  differenceInCalendarDays(newMPSLastDate, masterProductionScheduleLineDate.plannedDate) < 0) {
                    newMPSLastDate = masterProductionScheduleLineDate.plannedDate
                }
              }
          )
    )
    if (this.originalMPSLastDate === undefined  ||  newMPSLastDate === undefined  || 
          differenceInCalendarDays(newMPSLastDate!, this.originalMPSLastDate!) !== 0) {
        // we changed the last date of the MPS,
        this.moveSuccessor = moveSuccessor;
     
    }
  }

  // modify MPS dates after we close the modify MPS modal
  modifyMPSDates(productionLineId: number, currentInterval: Interval, 
    newInterval: Interval, moveSuccessor: boolean) {
    // we will change the MPS date only when at least the begin date or the end date is 
    // changed 
    if (differenceInCalendarDays(currentInterval.start, newInterval.start) == 0 &&
        differenceInCalendarDays(currentInterval.end, newInterval.end) == 0) {
          return;
        }


    // save the original daily quantity as we will 'move' the MPS plan. so we will
    // move along with the quantity
    let originalDailyQuantity: number[] = [];
    
    this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId)
    .forEach(
      masterProductionScheduleLine => 
          masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
            masterProductionScheduleLineDate => 
              originalDailyQuantity = [
                ...originalDailyQuantity, 
                masterProductionScheduleLineDate.plannedQuantity
              ]
          )
    ) 
    
    const currentDates = eachDayOfInterval(currentInterval);
    const newDates = eachDayOfInterval(newInterval);

    // see if we will need to remove some days
    const removedDates = currentDates.filter(
      currentDate => 
          !newDates.some(newDate => differenceInCalendarDays(currentDate, newDate) === 0)); 

    // see if we will need to add some days
    const addedDates = newDates.filter(
      newDate => 
          !currentDates.some(currentDate => differenceInCalendarDays(currentDate, newDate) === 0));
 
    // remove the dates
    this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId)
    .forEach(
      masterProductionScheduleLine => 
          // filter out the days that already removed
          masterProductionScheduleLine.masterProductionScheduleLineDates = 
              masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
                    masterProductionScheduleLineDate => !removedDates.some(
                      removedDate => differenceInCalendarDays(masterProductionScheduleLineDate.plannedDate, removedDate) === 0
                    )
              )
    )

    // add new dates
    
    this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId)
    .forEach(
      masterProductionScheduleLine => {        
        addedDates.forEach(
          addedDate => {
            // add the date only if it doesn't exists yet
            if (!masterProductionScheduleLine.masterProductionScheduleLineDates.some(
              masterProductionScheduleLineDate => isEqual(masterProductionScheduleLineDate.plannedDate, addedDate)
            )) {
              masterProductionScheduleLine.masterProductionScheduleLineDates = [
                ...masterProductionScheduleLine.masterProductionScheduleLineDates, 
                {  
                    // we will initiate the quantity as 0 and will refresh it later 
                    plannedQuantity: 0,
                    plannedDate: addedDate
                }
              ]
            }
          }
        )
      });
    // setup the planned quantity for the newly added date
    this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId)
    .forEach(
      masterProductionScheduleLine => {   
        masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
          masterProductionScheduleLineDate => 
          // only care about the date fall in the new date range
              newDates.some(newDate => differenceInCalendarDays(newDate, masterProductionScheduleLineDate.plannedDate) === 0)
        )
        .filter(
          // only care about the date with 0 planned quantity
          masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity === 0
        )
        .forEach(
          masterProductionScheduleLineDate => {
            // get the planned quantity from the original date range, by the correspondent date position 
            let index = 0;
            for(; index < newDates.length; index++) {
              if (differenceInCalendarDays(newDates[index], masterProductionScheduleLineDate.plannedDate) === 0) {
                // ok, we found the index of the date in the new range, get the quantity from the original date range
                if (index > originalDailyQuantity.length - 1) {
                  // ok, we may extend the original date range so we get more days than the original date range
                  // let's assign the quantity from the last date of the original date range and assign it to 
                  // all the date that fall beyond the range in the new date range
                  masterProductionScheduleLineDate.plannedQuantity = originalDailyQuantity[originalDailyQuantity.length - 1];
                }
                else {
                  masterProductionScheduleLineDate.plannedQuantity = originalDailyQuantity[index];
                }
                break;
              }
            }
          }
        )

      });
      
      // clear the selction
      
      this.rangeDates[productionLineId] = null;
       

      // see if we are chaging the last date of the current MPS  
      let newMPSLastDate: Date | undefined = undefined;
      this.currentMPS.masterProductionScheduleLines
      .forEach(
        masterProductionScheduleLine => 
            masterProductionScheduleLine.masterProductionScheduleLineDates.forEach(
              masterProductionScheduleLineDate => {
                  if (newMPSLastDate == null || 
                    differenceInCalendarDays(newMPSLastDate, masterProductionScheduleLineDate.plannedDate) < 0) {
                      newMPSLastDate = masterProductionScheduleLineDate.plannedDate
                  }
                }
            )
      ) 
      if (this.originalMPSLastDate === undefined  ||  newMPSLastDate === undefined  || 
            differenceInCalendarDays(newMPSLastDate!, this.originalMPSLastDate!) !== 0) {
          // we changed the last date of the MPS, 
          this.moveSuccessor = moveSuccessor;
      
      }

  }
 

  showAddMPSDateModal(productionLineId: number) {
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
        if (this.addMPSDateForm.value.dailyQuantity == null ||
              this.addMPSDateForm.value.dailyQuantity <= 0) {
                this.messageService.error(this.i18n.fanyi("daily-quantity-is-required"));
                return false;
        }
        this.addMPSDates(
          productionLineId,
          this.currentMPSDates, 
          this.addMPSDateForm.value.dailyQuantity
        );
        return true;
      },
      nzWidth: 1000,
    });
  }
 
  addMPSDates(productionLineId: number, mpsDates: Date[], dailyQuantity: number) : void {

    this.currentMPS.masterProductionScheduleLines
        .filter(masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId)
        .forEach(masterProductionScheduleLine => {
          mpsDates.forEach(
            mpsDate => {
              // if the date doesn't exists yet, add it
              if (!masterProductionScheduleLine.masterProductionScheduleLineDates.some(
                masterProductionScheduleLineDate => isEqual(masterProductionScheduleLineDate.plannedDate, mpsDate)
              )) {
                masterProductionScheduleLine.masterProductionScheduleLineDates = [
                  ...masterProductionScheduleLine.masterProductionScheduleLineDates, 
                  {                    
                      plannedQuantity: dailyQuantity,
                      plannedDate: mpsDate
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

  // if the date is already assigned to the current MPS on this production 
  isDateALreadyAssignedToCurrentMPS(date: Date, productionLineId: number): boolean { 
    return this.currentMPS.masterProductionScheduleLines.filter(
      masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId
    ).some(
      masterProductionScheduleLine =>  
        masterProductionScheduleLine.masterProductionScheduleLineDates.some(
          masterProductionScheduleLineDate =>  
          differenceInCalendarDays(masterProductionScheduleLineDate.plannedDate, date) === 0
          
        ) 
    );
  }
  

  // check if the production line is already assigned to an existing MPS on a specific date
  getExistingMPS(date: Date, productionLineId: number): MasterProductionSchedule | undefined {
    // console.log(`start to getExistingMPS with date ${date}, production line id ${productionLineId}`);
    if (!this.isDateValidForMPS(date)) {

      // console.log(`>>  date ${date} is not valid for MPS production line id ${productionLineId}`);
      return undefined;
    }
    const key = `${productionLineId  }-${ 
         date.getFullYear().toString()  }-${ 
         date.getMonth().toString()  }-${ 
         date.getDate().toString()}`;

    // console.log(`date: ${date}`)
    
    // console.log(`get existing mps by key ${key}`)
     
    if (this.existingMPSs[key] && this.existingMPSs[key].number === this.currentMPS.number) {

      return undefined;
    }

    
    return this.existingMPSs[key];
    
    // make sure 

  }
  getExistingMPSBGColorByDate(date: Date, productionLineId: number) : string{
    const masterProductionSchedule = this.getExistingMPS(date, productionLineId);

    if (masterProductionSchedule === undefined) {
      return this.colorService.White;
    }
    // key: production line id - MPS number
    // value: color value in Hex  
    const key = `${productionLineId  }-${  masterProductionSchedule.number}`;

    return this.existingMPSColors[key];

  }
  
  getExistingMPSBGColor(number: string, productionLineId: number) : string{
    
    const key = `${productionLineId  }-${  number}`;
    
    return this.existingMPSColors[key];

  }
  removeDateAssignedment(masterProductionScheduleLineDate: MasterProductionScheduleLineDate
    , productionLineId: number): void {
      this.currentMPS.masterProductionScheduleLines.filter(
        masterProductionScheduleLine => masterProductionScheduleLine.productionLine.id === productionLineId
      ).forEach(
        masterProductionScheduleLine =>  
          masterProductionScheduleLine.masterProductionScheduleLineDates = 
          masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
            existMPSDate => !isEqual(existMPSDate.plannedDate, masterProductionScheduleLineDate.plannedDate)
          )
      );
  }
  
  refreshNewMPSInterval(){
    this.isModifiedMPSDateModalSpinning = true;
    const movedDays = this.modifyMPSDateForm.value.movedDays ? 
        this.modifyMPSDateForm.value.movedDays : 0;
    const extendedDays = this.modifyMPSDateForm.value.extendedDays ? 
        this.modifyMPSDateForm.value.extendedDays : 0;

        
    // console.log(`start to move ${movedDays} days and extend ${extendedDays} days`);
    this.newMPSInterval = {
      start: addDays(this.currentMPSInterval!.start, movedDays),
      end: addDays(addDays(this.currentMPSInterval!.end, movedDays), extendedDays),
    }
    if (differenceInCalendarDays(this.newMPSInterval.start, this.newMPSInterval.end) > 0) {
      this.newMPSInterval = {
        start: this.newMPSInterval.start,
        end: this.newMPSInterval.start,
      }
    }
    this.validateNewMPSInterval(this.newMPSInterval);
    this.isModifiedMPSDateModalSpinning = false;
  }
  // check if the new MPS interval is valid or not
  validateNewMPSInterval(newMPSInterval: Interval) {

    // first all of, make sure all the date within the interval is valid for 
    // the MPS and not assigned to other MPS yet
    // console.log(`validate newMPSInterval: ${JSON.stringify(newMPSInterval)}`);
    if (eachDayOfInterval(newMPSInterval).some(
            date =>   this.getExistingMPS(date, this.modifiedMPSProductionLineId!))) {
               
        this.modifiedMPSDateOverlapWithOthers = true;
        this.modifiedMPSDateValid = false;
    }
    else if (eachDayOfInterval(newMPSInterval).some(
        date =>  differenceInCalendarDays( this.currentMPS.cutoffDate!, date) < 0)) {
        this.modifiedMPSDateBeyondCutoffDate = true;
        this.modifiedMPSDateValid = false;
    }
    else {
      this.modifiedMPSDateOverlapWithOthers = false;
      this.modifiedMPSDateBeyondCutoffDate = false;
      this.modifiedMPSDateValid = true;
    }
    
  }
  movedDaysChanged() {
    this.refreshNewMPSInterval(); 
    
  }
  extendedDaysChanged() {
    
    this.refreshNewMPSInterval(); 
  }

  // confirm page
  getDailyPlannedQuantity(masterProductionScheduleLine: MasterProductionScheduleLine, date: Date): number {
    return masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
      masterProductionScheduleLineDate => isEqual(masterProductionScheduleLineDate.plannedDate, date)
    )
    .map(masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity)
    .reduce((sum, current) => sum + current, 0);
  }
  
  getTotalDailyPlannedQuantity(date: Date): number {
    let totalQuantity = 0;
    this.currentMPS.masterProductionScheduleLines.forEach(
      masterProductionScheduleLine => totalQuantity += this.getDailyPlannedQuantity(masterProductionScheduleLine, date)
    )
    return totalQuantity;
  }

  getMonthlyPlannedQuantity(masterProductionScheduleLine: MasterProductionScheduleLine, date: Date): number {
    return masterProductionScheduleLine.masterProductionScheduleLineDates.filter(
      masterProductionScheduleLineDate => getMonth(masterProductionScheduleLineDate.plannedDate) === getMonth(date)
    )
    .map(masterProductionScheduleLineDate => masterProductionScheduleLineDate.plannedQuantity)
    .reduce((sum, current) => sum + current, 0);
  }
  getTotalMonthlyPlannedQuantity(date: Date): number {
    let totalQuantity = 0;
    this.currentMPS.masterProductionScheduleLines.forEach(
      masterProductionScheduleLine => totalQuantity += this.getMonthlyPlannedQuantity(masterProductionScheduleLine, date)
    )
    return totalQuantity;
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
              }, 500);
            },
            error: () => this.isSpinning = false
          })
    }
    else {
      
      this.masterProductionScheduleService.changeMasterProductionSchedule(this.currentMPS, this.moveSuccessor)
          .subscribe({
            next:() => {
              this.messageService.success(this.i18n.fanyi('message.action.success'));
              setTimeout(() => {
                this.isSpinning = false;
                this.router.navigateByUrl(`/work-order/mps?number=${this.currentMPS?.number}`);
              }, 500);
            },
            error: () => this.isSpinning = false
          })
    }
  }
}
