import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Customer } from '../../common/models/customer';
import { Item } from '../../inventory/models/item';
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
})
export class OutboundWaveMaintenanceComponent implements OnInit {

  isSpinning = false;
  loadingOrderDetailsRequest = 0;
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


  searchForm!: FormGroup;

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
  listOfDisplayOrders: Order[] = [];

  listOfAllOrderLines: OrderLine[] = [];
  listOfDisplayOrderLines: OrderLine[] = [];


  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private fb: FormBuilder,
    private waveService: WaveService,
    private message: NzMessageService,
    private router: Router,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.outbound.wave.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.outbound.wave.title'));

    this.searchForm = this.fb.group({
      waveNumber: [null],
      orderNumber: [null],
      customerName: [null],
    });
    this.searchForm.controls.waveNumber.enable();
    this.newWave = true;

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.loadWave(params.id);
      }
    });
  }

  loadWave(waveId: number): void {
    this.waveService.getWave(waveId).subscribe(waveRes => {
      this.setupWaveInformation(waveRes);
    });
  }
  setupWaveInformation(wave: Wave): void {
    this.currentWave = this.setupWaveQuantities(wave);
    console.log(`wave: ${JSON.stringify(wave)}`);

    this.searchForm.controls.waveNumber.setValue(this.currentWave.number);
    this.searchForm.controls.waveNumber.disable();
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
    this.waveService
      .findWaveCandidate(this.searchForm.controls.orderNumber.value, this.searchForm.controls.customerName.value)
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


    if (!this.newWave) {
      this.searchForm.controls.waveNumber.setValue(this.currentWave.number);
    }
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

  orderTableCurrentPageDataChange($event: Order[]): void {
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


  createWaveWithOrders(): void {
    const wavableOrderLines = this.getWavableOrderLines(this.getSelectedOrders());
    this.waveService
      .createWaveWithOrderLines(this.searchForm.controls.waveNumber.value, wavableOrderLines)
      .subscribe(wave => {
        this.message.info(this.i18n.fanyi('message.new.complete'));
        this.setupWaveInformation(wave);
        this.findWaveCandidate();
      });
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
    const wavableOrderLines = this.getSelectedOrderLines();
    this.waveService
      .createWaveWithOrderLines(this.searchForm.controls.waveNumber.value, wavableOrderLines)
      .subscribe(wave => {
        this.message.info(this.i18n.fanyi('message.new.complete'));
        this.setupWaveInformation(wave);
        this.findWaveCandidate();
      });
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

  setWaveNumber(event: Event): void {
    this.searchForm.controls.waveNumber.setValue((event.target as HTMLInputElement).value);
  }

  returnToPreviousPage(): void {
    console.log(`this.searchForm.controls.waveNumber.value: ${this.searchForm.controls.waveNumber.value}`);
    if (this.searchForm.controls.waveNumber.value) {
      this.router.navigateByUrl(`outbound/wave?number=${this.searchForm.controls.waveNumber.value}`);
    } else {
      this.router.navigateByUrl('outbound/wave');
    }
  }
}
