import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { ClientService } from '../../common/services/client.service';
import { CustomerService } from '../../common/services/customer.service';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { Order } from '../models/order';
import { OrderLine } from '../models/order-line';
import { Wave } from '../models/wave';
import { WaveService } from '../services/wave.service';

@Component({
  selector: 'app-outbound-wave-maintenance',
  templateUrl: './wave-maintenance.component.html',
  styleUrls: ['./wave-maintenance.component.less'],
})
export class OutboundWaveMaintenanceComponent implements OnInit {
  hideCriteria = false;
  isSpinning = false;
  loadingOrderDetailsRequest = 0;
  waveNumberModalVisible = false;
  selectedWavableOrderLine: OrderLine[] = [];

  listOfOrderTableColumns: Array<ColumnItem<Order>> = [
    {
      name: 'order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipToCustomer',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableObjField(a.shipToCustomer, b.shipToCustomer, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.billToCustomer',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableObjField(a.billToCustomer, b.billToCustomer, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.totalItemCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.totalOrderQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalExpectedQuantity, b.totalExpectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.totalOpenQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalOpenQuantity, b.totalOpenQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.totalInprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalInprocessQuantity, b.totalInprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.totalShippedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalShippedQuantity, b.totalShippedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];
  listOfOrderTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onOrderTableAllChecked(true);
      }
    }, 
  ];
  setOfOrderTableCheckedId = new Set<number>();
  orderTableChecked = false;
  orderTableIndeterminate = false;

  listOfOrderLineTableColumns: Array<ColumnItem<OrderLine>> = [
    {
      name: 'order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableString(a.orderNumber, b.orderNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableObjField(a.item, b.item, 'description'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.expectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.openQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.openQuantity, b.openQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.inprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.inprocessQuantity, b.inprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.line.shippedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableNumber(a.shippedQuantity, b.shippedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'inventory.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: OrderLine, b: OrderLine) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },

  ];

  listOfOrderLineTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onOrderLineTableAllChecked(true);
      }
    },
  ];
  setOfOrderLineTableCheckedId = new Set<number>();
  orderLineTableChecked = false;
  orderLineTableIndeterminate = false;


  searchForm!: UntypedFormGroup;

  newWaveNumberForm!: UntypedFormGroup;
  planWaveInProcess = false;
  newWave = true;

  pageTitle: string;
  currentWave: Wave = {
    id: undefined,
    number: '',
    status: undefined,
    shipmentLines: [],
    totalOrderCount: 0,
    totalOrderLineCount: 0,
    totalItemCount: 0,
    totalQuantity: 0,
    totalOpenQuantity: 0,
    totalInprocessQuantity: 0,
    totalPickedQuantity: 0,
    totalStagedQuantity: 0,
    totalShippedQuantity: 0,
  };

  listOfAllOrders: Order[] = [];
  listOfDisplayOrders: readonly  Order[] = [];

  listOfAllOrderLines: OrderLine[] = [];
  listOfDisplayOrderLines: OrderLine[] = [];
  validCustomers: Customer[] = [];
  
  threePartyLogisticsFlag = false;
  availableClients: Client[] = [];


  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private waveService: WaveService,
    private message: NzMessageService,
    private router: Router,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
    private customerService: CustomerService,
    private clientService: ClientService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.outbound.wave.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.outbound.wave.title'));
 
    this.searchForm = this.fb.group({
      orderNumber: [null], 
      customer: [null],  
      createdTimeRanger: [null],
      createdDate: [null],
      client: [null],
      singleOrderLineOnly: [null],
      singleOrderQuantityOnly: [null],
      singleOrderCaseQuantityOnly: [null],
    }); 
    this.newWave = true;

    console.log(`clear all the display`)
    this.clearDisplay();

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.loadWave(params.id);
      }
    });

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => this.validCustomers = customerRes
    });
    

    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
          // initiate the select control
          this.clientService.getClients().subscribe({
            next: (clientRes) => this.availableClients = clientRes
             
          });
        }
        else {
          this.threePartyLogisticsFlag = false;
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });

  }

  loadWave(waveId: number): void {
    this.isSpinning = true;
    this.waveService.getWave(waveId).subscribe({
      next: (waveRes)=> {
        this.setupWaveInformation(waveRes);
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
  }
  setupWaveInformation(wave: Wave): void {
    this.currentWave = this.setupWaveQuantities(wave);  
    this.newWave = false;
  }
  setupWaveQuantities(wave: Wave): Wave {
    let totalQuantity = 0;
    let totalOpenQuantity = 0;
    let totalInprocessQuantity = 0;
    let totalPickedQuantity = 0;
    let totalStagedQuantity = 0;
    let totalShippedQuantity = 0;

    const existingItemIds = new Set();
    const existingOrderNumbers = new Set();
    const existingOrderLineIds = new Set();

    wave.shipmentLines.forEach(shipmentLine => {
      totalQuantity += shipmentLine.quantity;
      totalOpenQuantity += shipmentLine.openQuantity;
      totalInprocessQuantity += shipmentLine.inprocessQuantity;
      shipmentLine.picks.forEach(pick => (totalPickedQuantity += pick.pickedQuantity));
      totalStagedQuantity += shipmentLine.stagedQuantity;
      totalShippedQuantity += shipmentLine.shippedQuantity;

      if (!existingItemIds.has(shipmentLine.orderLine.itemId)) {
        existingItemIds.add(shipmentLine.orderLine.itemId);
      }
      if (!existingOrderNumbers.has(shipmentLine.orderNumber)) {
        existingOrderNumbers.add(shipmentLine.orderNumber);
      }
      if (!existingOrderLineIds.has(shipmentLine.orderLine.id)) {
        existingOrderLineIds.add(shipmentLine.orderLine.id);
      }
    });

    wave.totalOrderCount = existingOrderNumbers.size;
    wave.totalOrderLineCount = existingOrderLineIds.size;
    wave.totalItemCount = existingItemIds.size;

    wave.totalQuantity = totalQuantity;
    wave.totalOpenQuantity = totalOpenQuantity;
    wave.totalInprocessQuantity = totalInprocessQuantity;
    wave.totalPickedQuantity = totalPickedQuantity;
    wave.totalStagedQuantity = totalStagedQuantity;
    wave.totalShippedQuantity = totalShippedQuantity;
    return wave;
  }

  findWaveCandidate(): void {
    this.isSpinning = true;
    
    let startCreatedTime : Date = this.searchForm.controls.createdTimeRanger.value ? 
        this.searchForm.controls.createdTimeRanger.value[0] : undefined; 
    let endCreatedTime : Date = this.searchForm.controls.createdTimeRanger.value ? 
        this.searchForm.controls.createdTimeRanger.value[1] : undefined; 
    let specificCreatedDate : Date = this.searchForm.controls.createdDate.value;

    this.waveService
      .findWaveCandidate(this.searchForm.controls.orderNumber.value, 
        this.searchForm.controls.client.value, 
        undefined,
        this.searchForm.controls.customer.value, 
        startCreatedTime, 
        endCreatedTime, specificCreatedDate, 
        this.searchForm.controls.singleOrderLineOnly.value,
        this.searchForm.controls.singleOrderQuantityOnly.value,
        this.searchForm.controls.singleOrderCaseQuantityOnly.value,)
      .subscribe({

        next: (wavableOrders)  => {
          this.listOfAllOrders = this.calculateQuantities(wavableOrders);
          this.listOfDisplayOrders = this.calculateQuantities(wavableOrders);
  
  
          this.listOfAllOrderLines = this.getWavableOrderLines(wavableOrders);
          this.listOfDisplayOrderLines = this.getWavableOrderLines(wavableOrders);
  
          this.refreshDetailInformations(this.listOfAllOrders);
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
        
      });
  }

  calculateQuantities(orders: Order[]): Order[] {
    orders.forEach(order => {
      const existingItemIds = new Set();
      order.totalLineCount = order.orderLines.length;
      order.totalItemCount = 0;
      order.totalExpectedQuantity = 0;
      order.totalOpenQuantity = 0;
      order.totalInprocessQuantity = 0;
      order.totalShippedQuantity = 0;

      order.orderLines.forEach(orderLine => {
        order.totalExpectedQuantity! += orderLine.expectedQuantity;
        order.totalOpenQuantity! += orderLine.openQuantity;
        order.totalInprocessQuantity! += orderLine.inprocessQuantity;
        order.totalShippedQuantity! += orderLine.shippedQuantity;
        if (!existingItemIds.has(orderLine.item!.id)) {
          existingItemIds.add(orderLine.item!.id);
        }
      });
      order.totalItemCount = existingItemIds.size;
    });
    return orders;
  }

  getWavableOrderLines(wavableOrders: Order[]): OrderLine[] {
    let wavableOrderLines: OrderLine[] = [];

    wavableOrders.forEach(order => {
      wavableOrderLines = wavableOrderLines.concat(order.orderLines);
    });
    return wavableOrderLines;
  }

  
  // we will load the client / supplier / item information 
  // asyncronized
  async refreshDetailInformations(orders: Order[]) {  
    // const currentPageOrders = this.getCurrentPageOrders(); 
    let index = 0;
    this.loadingOrderDetailsRequest = 0;
    while (index < orders.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 orders at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time
      // console.log(`1. this.loadingOrderDetailsRequest: ${this.loadingOrderDetailsRequest}`);
      
      
      while(this.loadingOrderDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshDetailInformation(orders[index]);
      index++;
    } 
    while(this.loadingOrderDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }   
  }
 
  refreshDetailInformation(order: Order) {
    
      this.loadCustomer(order); 
      
  }

  loadCustomer(order: Order) {
      
    if (order.billToCustomerId && order.billToCustomer == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getCustomer(order.billToCustomerId).subscribe(
        {
          next: (res) => {
            order.billToCustomer = res; 
          
            this.loadingOrderDetailsRequest--;
          }
        }
      );      
    } 
    
    if (order.shipToCustomerId && order.shipToCustomer == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getCustomer(order.shipToCustomerId).subscribe(
        {
          next: (res) => {
            order.shipToCustomer = res; 
            
            this.loadingOrderDetailsRequest--;
          }
        }
      );      
    } 
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  clearDisplay(): void {
    this.searchForm.reset();

    this.listOfAllOrders = [];
    this.listOfDisplayOrders = [];
    this.listOfAllOrderLines = [];
    this.listOfDisplayOrderLines = [];
 
  }

  updateOrderTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfOrderTableCheckedId.add(id);
    } else {
      this.setOfOrderTableCheckedId.delete(id);
    }
  }

  onOrderTableItemChecked(id: number, checked: boolean): void {
    this.updateOrderTableCheckedSet(id, checked);
    this.refreshOrderTableCheckedStatus();
  } 

  onOrderTableAllChecked(value: boolean): void {
    this.listOfDisplayOrders!.forEach(item => this.updateOrderTableCheckedSet(item.id!, value));
    this.refreshOrderTableCheckedStatus();
  }
  onOrderTableThisPageChecked(value: boolean): void {
    this.listOfDisplayOrders!.forEach(item => this.updateOrderTableCheckedSet(item.id!, false));
    this.listOfDisplayOrders!.forEach(item => this.updateOrderTableCheckedSet(item.id!, value));
    this.refreshOrderTableCheckedStatus();
  }

  orderTableCurrentPageDataChange($event: readonly Order[]): void {
    this.listOfDisplayOrders! = $event;
    this.refreshOrderTableCheckedStatus();
  }

  refreshOrderTableCheckedStatus(): void {
    this.orderTableChecked = this.listOfDisplayOrders!.every(item => this.setOfOrderTableCheckedId.has(item.id!));
    this.orderTableIndeterminate = this.listOfDisplayOrders!.some(item => this.setOfOrderTableCheckedId.has(item.id!)) && !this.orderTableChecked;
  }


  updateOrderLineTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfOrderLineTableCheckedId.add(id);
    } else {
      this.setOfOrderLineTableCheckedId.delete(id);
    }
  }

  onOrderLineTableItemChecked(id: number, checked: boolean): void {
    this.updateOrderLineTableCheckedSet(id, checked);
    this.refreshOrderLineTableCheckedStatus();
  }

  onOrderLineTableAllChecked(value: boolean): void {
    this.listOfDisplayOrderLines!.forEach(item => this.updateOrderLineTableCheckedSet(item.id!, value));
    this.refreshOrderLineTableCheckedStatus();
  }

  orderLineTableCurrentPageDataChange($event: OrderLine[]): void {
    this.listOfDisplayOrderLines! = $event;
    this.refreshOrderLineTableCheckedStatus();
  }

  refreshOrderLineTableCheckedStatus(): void {
    this.orderLineTableChecked = this.listOfDisplayOrderLines!.every(item => this.setOfOrderLineTableCheckedId.has(item.id!));
    this.orderLineTableIndeterminate = this.listOfDisplayOrderLines!.some(item => this.setOfOrderLineTableCheckedId.has(item.id!)) && !this.orderLineTableChecked;
  }

  openNewWaveNumberModal() {
    if (this.selectedWavableOrderLine.length == 0) {
      this.message.error(this.i18n.fanyi("no-order-selected"));
      this.waveNumberModalVisible = false;
      return;
    }

    this.waveNumberModalVisible = true;
    this.newWaveNumberForm = this.fb.group({
      waveNumber: [null], 
    });

  }
 
  createWaveWithOrders(): void {
    this.selectedWavableOrderLine = this.getWavableOrderLines(this.getSelectedOrders());
    if (!this.newWave) {

      this.planWaveWithOrderLines(this.currentWave.number, this.selectedWavableOrderLine);
    }
    else {
      this.openNewWaveNumberModal();

    }
  }

  getSelectedOrders(): Order[] {
    const selectedOrders: Order[] = [];
    this.listOfDisplayOrders.forEach((order: Order) => {
      if (this.setOfOrderTableCheckedId.has(order.id!)) {
        selectedOrders.push(order);
      }
    });
    return selectedOrders;
  }

  createWaveWithOrderLines(): void {
    this.selectedWavableOrderLine = this.getSelectedOrderLines(); 
    
    if (!this.newWave) {

      this.planWaveWithOrderLines(this.currentWave.number, this.selectedWavableOrderLine);
    }
    else {
      this.openNewWaveNumberModal();

    }
  }

  getSelectedOrderLines(): OrderLine[] {
    const selectedOrderLines: OrderLine[] = [];
    this.listOfDisplayOrderLines.forEach((orderLine: OrderLine) => {
      if (this.setOfOrderLineTableCheckedId.has(orderLine.id!)) {
        selectedOrderLines.push(orderLine);
      }
    });
    return selectedOrderLines;
  }

  setWaveNumber(newReceiptNumber: string): void {
    this.newWaveNumberForm.controls.waveNumber.setValue(newReceiptNumber);
  }

  returnToPreviousPage(): void {
     if (this.currentWave) {
      
      this.router.navigateByUrl(`outbound/wave?number=${this.currentWave.number}`); 
     }
     else {
      this.router.navigateByUrl(`outbound/wave`); 

     }
  }

  cancelNewWave() {

    this.waveNumberModalVisible = false;
  }
  createNewWave() {

    this.planWaveWithOrderLines(
      this.newWaveNumberForm.controls.waveNumber.value, 
      this.selectedWavableOrderLine);
  }
  planWaveWithOrderLines(waveNumber: string, orderLiens: OrderLine[]) {

    this.isSpinning = true;
    this.planWaveInProcess = true;
    this.waveService
      .planWaveWithOrderLines(waveNumber, orderLiens)
      .subscribe({

        next: (wave) =>{
          this.isSpinning = false;
          this.planWaveInProcess = false;
          this.message.info(this.i18n.fanyi('message.action.success'));
          if (this.newWave) { 
  
            this.router.navigateByUrl(`/outbound/wave-maintenance?id=${wave.id}`);
            this.clearDisplay();
            this.loadWave(wave.id!);
          }
          else {
   
            this.setupWaveInformation(wave);
            this.findWaveCandidate();
            this.waveNumberModalVisible = false;
          } 
        },
        error: () => {
          this.isSpinning = false
          this.planWaveInProcess = false;
        }

      });  
  }
}
