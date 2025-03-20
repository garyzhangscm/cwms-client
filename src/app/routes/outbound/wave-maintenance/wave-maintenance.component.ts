import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent, STData } from '@delon/abc/st';
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
import { Shipment } from '../models/shipment';
import { ShipmentLine } from '../models/shipment-line';
import { ShipmentStatus } from '../models/shipment-status.enum';
import { Wave } from '../models/wave';
import { WaveStatus } from '../models/wave-status.enum';
import { ShipmentLineService } from '../services/shipment-line.service';
import { WaveService } from '../services/wave.service';

@Component({
    selector: 'app-outbound-wave-maintenance',
    templateUrl: './wave-maintenance.component.html',
    styleUrls: ['./wave-maintenance.component.less'],
    standalone: false
})
export class OutboundWaveMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  hideCriteria = false;
  isSpinning = false;
  loadingOrderDetailsRequest = 0;
  loadingShipmentDetailsRequest = 0;
  waveNumberModalVisible = false;
  selectedWavableOrderLines: OrderLine[] = [];
  selectedWavableShipmentLines: ShipmentLine[] = [];

  planWaveWithOrderLineFlag = true;

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

  // plan wave by 
  // 1. order
  // 2. order line
  // 3. shipment
  // 4. shipment line
  planWaveByCategoryIndex = 0;

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

  waveableShipments: Shipment[] = [];
  
  threePartyLogisticsFlag = false;
  availableClients: Client[] = [];


  constructor(
    private activatedRoute: ActivatedRoute, 
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private shipmentLineService: ShipmentLineService,
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
      if (params['id']) {
        this.loadWave(params['id']);
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
        
        this.shipmentLineService.getShipmentLinesByWave(waveRes.id!).subscribe({
          next:(shipmentlineRes) => {
            waveRes.shipmentLines = shipmentlineRes;
            this.setupWaveInformation(waveRes);
            this.isSpinning = false;
          }, 
          error: () => this.isSpinning = false
        })

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

    const loadNumbers = new Set(); 
    const billOfLadingNumbers = new Set(); 


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
      
      if (shipmentLine.shipmentLoadNumber != null) {
        loadNumbers.add(shipmentLine.shipmentLoadNumber);
      }
      if (shipmentLine.shipmentBillOfLadingNumber != null) {
        billOfLadingNumbers.add(shipmentLine.shipmentBillOfLadingNumber);
      }

    });
    

    wave.loadNumbers = Array.from(loadNumbers).join(",");
    wave.billOfLadingNumbers = Array.from(billOfLadingNumbers).join(",");

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
    
    let startCreatedTime : Date = this.searchForm.value.createdTimeRanger ? 
        this.searchForm.value.createdTimeRanger[0] : undefined; 
    let endCreatedTime : Date = this.searchForm.value.createdTimeRanger ? 
        this.searchForm.value.createdTimeRanger[1] : undefined; 
    let specificCreatedDate : Date = this.searchForm.value.createdDate;

    this.waveService
      .findWaveableOrderCandidate(this.searchForm.value.orderNumber, 
        this.searchForm.value.client, 
        undefined,
        this.searchForm.value.customer, 
        startCreatedTime, 
        endCreatedTime, specificCreatedDate, 
        this.searchForm.value.singleOrderLineOnly,
        this.searchForm.value.singleOrderQuantityOnly,
        this.searchForm.value.singleOrderCaseQuantityOnly,)
      .subscribe({

        next: (wavableOrders)  => {
          this.listOfAllOrders = this.calculateOrderQuantities(wavableOrders);
          this.listOfDisplayOrders = this.calculateOrderQuantities(wavableOrders);
  
  
          this.listOfAllOrderLines = this.getWavableOrderLines(wavableOrders);
          this.listOfDisplayOrderLines = this.getWavableOrderLines(wavableOrders);
  
          this.refreshOrderDetailInformations(this.listOfAllOrders);
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
        
      });

    this.waveService
      .findWaveableShipmentCandidate(this.searchForm.value.orderNumber, 
        this.searchForm.value.client, 
        undefined,
        this.searchForm.value.customer, 
        startCreatedTime, 
        endCreatedTime, specificCreatedDate, 
        this.searchForm.value.singleOrderLineOnly,
        this.searchForm.value.singleOrderQuantityOnly,
        this.searchForm.value.singleOrderCaseQuantityOnly,)
      .subscribe({

        next: (waveableShipmentsRes)  => {
          this.waveableShipments = this.calculateShipmentQuantities(waveableShipmentsRes); 
   
          this.refreshShipmentDetailInformations(this.waveableShipments);
          this.isSpinning = false;
        },
        error: () => this.isSpinning = false
        
      });
  }

  calculateOrderQuantities(orders: Order[]): Order[] {
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


  calculateShipmentQuantities(shipments: Shipment[]): Shipment[] {
    shipments.forEach(shipment => {
      const existingItemIds = new Set();
      shipment.totalLineCount = shipment.shipmentLines.length;
      shipment.totalItemCount = 0;

      shipment.totalQuantity = 0;
      shipment.totalOpenQuantity = 0;
      shipment.totalInprocessQuantity = 0;
      shipment.totalLoadedQuantity = 0;
      shipment.totalShippedQuantity = 0;

      shipment.shipmentLines.forEach(shipmentLine => {
        shipment.totalQuantity! += shipmentLine.quantity;
        shipment.totalOpenQuantity! += shipmentLine.openQuantity;
        shipment.totalInprocessQuantity! += shipmentLine.inprocessQuantity;
        shipment.totalLoadedQuantity! += shipmentLine.loadedQuantity;
        shipment.totalShippedQuantity! += shipmentLine.shippedQuantity;
        if (!existingItemIds.has(shipmentLine.orderLine.itemId)) {
          existingItemIds.add(shipmentLine.orderLine.itemId);
        }
      });

      shipment.totalItemCount = existingItemIds.size;
    });
    return shipments;
  }


  getWavableOrderLines(wavableOrders: Order[]): OrderLine[] {
    let wavableOrderLines: OrderLine[] = [];

    wavableOrders.forEach(order => {
      wavableOrderLines = wavableOrderLines.concat(order.orderLines);
    });
    return wavableOrderLines;
  }
  getWavableShipmentLines(wavableShipments: Shipment[]): ShipmentLine[] {
    let wavableShipmentLines: ShipmentLine[] = [];

    wavableShipments.forEach(shipment => {
      wavableShipmentLines = wavableShipmentLines.concat(shipment.shipmentLines);
    });
    return wavableShipmentLines;
  }

  
  // we will load the client / supplier / item information 
  // asyncronized
  async refreshOrderDetailInformations(orders: Order[]) {  
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
      
      this.refreshOrderDetailInformation(orders[index]);
      index++;
    } 
    while(this.loadingOrderDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }   
  }
  
  async refreshShipmentDetailInformations(shipments: Shipment[]) {  
    
    let index = 0;
    this.loadingShipmentDetailsRequest = 0;
    while (index < shipments.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 shipments at a time(each shipment may have 5 different request). 
      // we will get error if we flush requests for
      // too many shipments into the server at a time 
      
      
      while(this.loadingShipmentDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshShipmentDetailInformation(shipments[index]);
      index++;
    } 
    while(this.loadingShipmentDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }   
  }
 
  refreshOrderDetailInformation(order: Order) {
    
      this.loadCustomerForOrder(order); 
      
  }
  refreshShipmentDetailInformation(shipment: Shipment) {
    
      this.loadCustomerForShipment(shipment); 
      
  }

  loadCustomerForOrder(order: Order) {
      
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
  
  loadCustomerForShipment(shipment: Shipment) { 
    
    if (shipment.shipToCustomerId && shipment.shipToCustomer == null) {
      this.loadingShipmentDetailsRequest++;
      this.localCacheService.getCustomer(shipment.shipToCustomerId).subscribe(
        {
          next: (res) => {
            shipment.shipToCustomer = res; 
            
            this.loadingShipmentDetailsRequest--;
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

  openNewWaveNumberModal(planWaveWithOrderLineFlag: boolean) {
    this.planWaveWithOrderLineFlag = planWaveWithOrderLineFlag;
 

    this.waveNumberModalVisible = true;
    this.newWaveNumberForm = this.fb.group({
      waveNumber: [null], 
      comment: [null], 
    });

  }
 
  createWaveWithOrders(): void {
    let selectedOrders = this.getSelectedOrders();
    if (selectedOrders.length == 0) {
      this.message.error("please select at least order to continue");
      return;
    }
    this.selectedWavableOrderLines = this.getWavableOrderLines(selectedOrders);
    if (!this.newWave) {

      this.planWaveWithOrderLines(this.currentWave.number, this.selectedWavableOrderLines);
    }
    else {
      this.openNewWaveNumberModal(true);

    }
  }
  
  createWaveWithShipments(): void { 
    const selectedShipments : Shipment[] = this.getSelectedShipments();
    if (selectedShipments.length == 0) {
      this.message.error("please select at least one shipment to continue");
      return;
    }

    this.selectedWavableShipmentLines = this.getWavableShipmentLines(selectedShipments);
    
    if (!this.newWave) {

      this.planWaveWithShipmentLines(this.currentWave.number, this.selectedWavableShipmentLines);
    }
    else {
      this.openNewWaveNumberModal(false);

    }

  }
  getSelectedShipments(): Shipment[] {
    let selectedShipments: Shipment[] = [];
    
    const dataList: STData[] = this.shipmentTable.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedShipments = [...selectedShipments,
              ...this.waveableShipments.filter(
                shipment => shipment.id == data["id"]
              )
          ]

        }
      );
    return selectedShipments;
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
    this.selectedWavableOrderLines = this.getSelectedOrderLines(); 
    if (this.selectedWavableOrderLines.length == 0) {
      this.message.error("please select at least one order line to continue");
      return;
    }
    
    if (!this.newWave) {

      this.planWaveWithOrderLines(this.currentWave.number, this.selectedWavableOrderLines);
    }
    else {
      this.openNewWaveNumberModal(true);

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
    this.newWaveNumberForm.value.waveNumber.setValue(newReceiptNumber);
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

    if (this.planWaveWithOrderLineFlag) {

      this.planWaveWithOrderLines(
        this.newWaveNumberForm.value.waveNumber, 
        this.selectedWavableOrderLines,
        this.newWaveNumberForm.value.comment );
    }
    else {
      this.planWaveWithShipmentLines(
        this.newWaveNumberForm.value.waveNumber, 
        this.selectedWavableShipmentLines,
        this.newWaveNumberForm.value.comment );

    }
  }
  planWaveWithOrderLines(waveNumber: string, orderLines: OrderLine[], comment?: string) {

    this.isSpinning = true;
    this.planWaveInProcess = true;
    
    const orderLineIds = orderLines.map(orderLine => orderLine.id);

    this.waveService
      .planWaveWithOrderLines(waveNumber, orderLineIds, comment)
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
  
  planWaveWithShipmentLines(waveNumber: string, shipmentLines: ShipmentLine[], comment?: string) {

    this.isSpinning = true;
    this.planWaveInProcess = true;
    
    const shipmentLineIds = shipmentLines.map(shipmentLine => shipmentLine.id);

    this.waveService
      .planWaveWithShipmentLines(waveNumber, shipmentLineIds, comment)
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

  planWaveByCategoryIndexChanged(newIndex: number) {
    this.planWaveByCategoryIndex = newIndex;
  }

  
  @ViewChild('shipmentTable', { static: false })
  shipmentTable!: STComponent;
  shipmentTableColumns : STColumn[] = [ 
    { title: '', index: 'number', type: 'checkbox' },

    { title: this.i18n.fanyi("shipment.number"), index: 'number' , width: 150, 
      sort: {
        compare: (a, b) => a.number.localeCompare(b.number)
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.number === filter.value,
        multiple: true
      }
    },   
    { title: this.i18n.fanyi("shipment.status"), render: 'statusColumn', width: 150,  
      sort: {
        compare: (a, b) => a.status.localeCompare(b.status)
      },
      filter: {
        menus:  [
          { text: this.i18n.fanyi('SHIPMENT-STATUS-' + ShipmentStatus.PENDING), value: ShipmentStatus.PENDING },
          { text: this.i18n.fanyi('SHIPMENT-STATUS-' + ShipmentStatus.INPROCESS), value: ShipmentStatus.INPROCESS }, 
          { text: this.i18n.fanyi('SHIPMENT-STATUS-' + ShipmentStatus.STAGED), value:  ShipmentStatus.STAGED },
          { text: this.i18n.fanyi('SHIPMENT-STATUS-' + ShipmentStatus.LOADING_IN_PROCESS), value:  ShipmentStatus.LOADING_IN_PROCESS },
          { text: this.i18n.fanyi('SHIPMENT-STATUS-' + ShipmentStatus.LOADED), value:  ShipmentStatus.LOADED },
          { text: this.i18n.fanyi('SHIPMENT-STATUS-' + ShipmentStatus.DISPATCHED), value: ShipmentStatus.DISPATCHED }
        ] ,
        fn: (filter, record) => record.status === filter.value,
        multiple: true
      }
    },   
    { title: this.i18n.fanyi("order.number"), index: 'orderNumbers' , width: 150, 
      sort: {
        compare: (a, b) => a.orderNumbers.localeCompare(b.orderNumbers)
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.orderNumbers.contains(filter.value),
        multiple: true
      }
    },
    { title: this.i18n.fanyi("shipment.totalLineCount"), index: 'totalLineCount', width: 150, 
      sort: {
        compare: (a, b) => a.totalLineCount - b.totalLineCount
      },
    },  
    { title: this.i18n.fanyi("wave.totalItemCount"), index: 'totalItemCount' , width: 150, 
      sort: {
        compare: (a, b) => a.totalItemCount - b.totalItemCount
      },
    },  
    { title: this.i18n.fanyi("wave.totalQuantity"), index: 'totalQuantity' , width: 150, 
      sort: {
        compare: (a, b) => a.totalQuantity - b.totalQuantity
      },
    },   
    { title: this.i18n.fanyi("wave.totalOpenQuantity"), index: 'totalOpenQuantity', width: 150 , 
      sort: {
        compare: (a, b) => a.totalOpenQuantity - b.totalOpenQuantity
      },
    },  
    { title: this.i18n.fanyi("wave.totalInprocessQuantity"), index: 'totalInprocessQuantity', width: 150 , 
      sort: {
        compare: (a, b) => a.totalInprocessQuantity - b.totalInprocessQuantity
      },
    },  
    { title: this.i18n.fanyi("wave.totalStagedQuantity"), index: 'totalStagedQuantity', width: 150, 
      sort: {
        compare: (a, b) => a.totalStagedQuantity - b.totalStagedQuantity
      },
    },  
    { title: this.i18n.fanyi("wave.totalLoadedQuantity"), index: 'totalLoadedQuantity' , width: 150, 
      sort: {
        compare: (a, b) => a.totalLoadedQuantity - b.totalLoadedQuantity
      },
    },  
    { title: this.i18n.fanyi("wave.totalShippedQuantity"), index: 'totalShippedQuantity', width: 150, 
      sort: {
        compare: (a, b) => a.totalShippedQuantity - b.totalShippedQuantity
      },
    },    
   
  ];


  waveCommentChanged(comment: string) {
    this.isSpinning = true;
    this.waveService.changeWaveComment(this.currentWave.id!, comment)
    .subscribe({
      next: (waveRes) => {
        this.currentWave = this.setupWaveQuantities(waveRes);   
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
      
    })
  }
  
  waveLoadNumberChanged(loadNumber: string) {
    this.isSpinning = true;
    this.waveService.changeWaveLoadNumber(this.currentWave.id!, loadNumber)
    .subscribe({
      next: (waveRes) => {
        this.currentWave = this.setupWaveQuantities(waveRes);   
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
      
    })
  }
  waveBillOfLadingNumberChanged(billOfLadingNumber: string) {
    this.isSpinning = true;
    this.waveService.changeWaveBillOfLadingNumber(this.currentWave.id!, billOfLadingNumber)
    .subscribe({
      next: (waveRes) => {
        this.currentWave = this.setupWaveQuantities(waveRes);   
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
      
    })
  }
  
  isWaveOpenForNewOrderShipment(wave: Wave): boolean {
    return wave.status != WaveStatus.COMPLETED && wave.status != WaveStatus.CANCELLED;
  } 
}
