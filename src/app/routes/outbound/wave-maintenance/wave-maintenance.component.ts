import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { Wave } from '../models/wave';
import { OrderLine } from '../models/order-line';
import { Order } from '../models/order';
import { WaveService } from '../services/wave.service';
import { Customer } from '../../common/models/customer';
import { Item } from '../../inventory/models/item';

@Component({
  selector: 'app-outbound-wave-maintenance',
  templateUrl: './wave-maintenance.component.html',
})
export class OutboundWaveMaintenanceComponent implements OnInit {
  searchForm: FormGroup;

  newWave: boolean;

  pageTitle: string;
  currentWave: Wave = {
    id: null,
    number: '',
    status: null,
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

  // control for table of order and order line
  // checkbox - select all
  orderTableAllChecked = false;
  orderTableIndeterminate = false;
  orderLineTableAllChecked = false;
  orderLineTableIndeterminate = false;
  // list of checked checkbox
  orderTableMapOfCheckedId: { [key: string]: boolean } = {};
  orderLineTableMapOfCheckedId: { [key: string]: boolean } = {};

  // Filters meta data
  filtersByShipToCustomer = [];
  filtersByBillToCustomer = [];
  filtersByItem = [];
  // Save filters that already selected
  selectedFiltersByBillToCustomer: string[] = [];
  selectedFiltersByShipToCustomer: string[] = [];
  selectedFiltersByItem: string[] = [];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  orderTableSortKey: string | null = null;
  orderTableSortValue: string | null = null;
  orderLineTableSortKey: string | null = null;
  orderLineTableSortValue: string | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private fb: FormBuilder,
    private waveService: WaveService,
    private message: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.outbound.wave.title');
  }

  ngOnInit() {
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

  loadWave(waveId: number) {
    this.waveService.getWave(waveId).subscribe(waveRes => {
      this.setupWaveInformation(waveRes);
    });
  }
  setupWaveInformation(wave: Wave) {
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

  findWaveCandidate() {
    this.waveService
      .findWaveCandidate(this.searchForm.controls.orderNumber.value, this.searchForm.controls.customerName.value)
      .subscribe(wavableOrders => {
        this.listOfAllOrders = this.calculateQuantities(wavableOrders);
        this.listOfDisplayOrders = this.calculateQuantities(wavableOrders);

        this.filtersByShipToCustomer = [];
        this.filtersByBillToCustomer = [];
        this.filtersByItem = [];

        const existingItemId = new Set();
        const existingShipToCustomerId = new Set();
        const existingBillToCustomerId = new Set();

        this.listOfAllOrders.forEach(order => {
          if (order.shipToCustomer && !existingShipToCustomerId.has(order.shipToCustomer.id)) {
            this.filtersByShipToCustomer.push({
              text: order.shipToCustomer.name,
              value: order.shipToCustomer.id,
            });
            existingShipToCustomerId.add(order.shipToCustomer.id);
          }
          if (order.billToCustomer && !existingBillToCustomerId.has(order.billToCustomer.id)) {
            this.filtersByBillToCustomer.push({
              text: order.billToCustomer.name,
              value: order.billToCustomer.id,
            });
            existingBillToCustomerId.add(order.billToCustomer.id);
          }
        });

        this.listOfAllOrderLines = this.getWavableOrderLines(wavableOrders);
        this.listOfDisplayOrderLines = this.getWavableOrderLines(wavableOrders);

        this.listOfAllOrderLines.forEach(orderLine => {
          if (orderLine.item && !existingItemId.has(orderLine.item.id)) {
            this.filtersByItem.push({
              text: orderLine.item.name,
              value: orderLine.item.id,
            });
            existingItemId.add(orderLine.item.id);
          }
        });
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
        order.totalExpectedQuantity += orderLine.expectedQuantity;
        order.totalOpenQuantity += orderLine.openQuantity;
        order.totalInprocessQuantity += orderLine.inprocessQuantity;
        order.totalShippedQuantity += orderLine.shippedQuantity;
        if (!existingItemIds.has(orderLine.item.id)) {
          existingItemIds.add(orderLine.item.id);
        }
      });
      order.totalItemCount = existingItemIds.size;
    });
    return orders;
  }

  getWavableOrderLines(wavableOrders: Order[]): OrderLine[] {
    let wavableOrderLines = [];

    wavableOrders.forEach(order => {
      wavableOrderLines = wavableOrderLines.concat(order.orderLines);
    });
    return wavableOrderLines;
  }

  clearDisplay() {
    this.searchForm.reset();

    this.listOfAllOrders = [];
    this.listOfDisplayOrders = [];
    this.listOfAllOrderLines = [];
    this.listOfDisplayOrderLines = [];

    this.filtersByShipToCustomer = [];
    this.filtersByBillToCustomer = [];
    this.filtersByItem = [];
    // Save filters that already selected
    this.selectedFiltersByBillToCustomer = [];
    this.selectedFiltersByShipToCustomer = [];
    this.selectedFiltersByItem = [];

    if (!this.newWave) {
      this.searchForm.controls.waveNumber.setValue(this.currentWave.number);
    }
  }

  sortOrderTable(sort: { key: string; value: string }): void {
    this.orderTableSortKey = sort.key;
    this.orderTableSortValue = sort.value;
    this.sortAndFilterOrderTable();
  }
  sortOrderLineTable(sort: { key: string; value: string }): void {
    this.orderLineTableSortKey = sort.key;
    this.orderLineTableSortValue = sort.value;
    this.sortAndFilterOrderLineTable();
  }

  filterOrderTable(selectedFiltersByBillToCustomer: string[], selectedFiltersByShipToCustomer: string[]) {
    this.selectedFiltersByShipToCustomer = selectedFiltersByShipToCustomer;
    this.selectedFiltersByBillToCustomer = selectedFiltersByBillToCustomer;
    this.sortAndFilterOrderTable();
  }
  filterOrderLineTable(selectedFiltersByItem: string[]) {
    this.selectedFiltersByItem = selectedFiltersByItem;
    this.sortAndFilterOrderLineTable();
  }

  sortAndFilterOrderTable() {
    // filter data
    const filterFunc = (order: { shipToCustomer: Customer; billToCustomer: Customer }) =>
      (this.selectedFiltersByShipToCustomer.length
        ? this.selectedFiltersByShipToCustomer.some(customerId => order.shipToCustomer.id === +customerId)
        : true) &&
      (this.selectedFiltersByBillToCustomer.length
        ? this.selectedFiltersByBillToCustomer.some(customerId => order.billToCustomer.id === +customerId)
        : true);
    const data = this.listOfAllOrders.filter(order => filterFunc(order));

    // sort data
    if (this.orderTableSortKey && this.orderTableSortValue) {
      this.listOfDisplayOrders = data.sort((a, b) =>
        this.orderTableSortValue === 'ascend'
          ? a[this.orderTableSortKey!] > b[this.orderTableSortKey!]
            ? 1
            : -1
          : b[this.orderTableSortKey!] > a[this.orderTableSortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayOrders = data;
    }
  }

  sortAndFilterOrderLineTable() {
    // filter data
    const filterFunc = (orderLine: { item: Item }) =>
      this.selectedFiltersByItem.length
        ? this.selectedFiltersByItem.some(itemId => orderLine.item.id === +itemId)
        : true;
    const data = this.listOfAllOrderLines.filter(orderLine => filterFunc(orderLine));

    // sort data
    if (this.orderLineTableSortKey && this.orderLineTableSortValue) {
      this.listOfDisplayOrderLines = data.sort((a, b) =>
        this.orderLineTableSortValue === 'ascend'
          ? a[this.orderLineTableSortKey!] > b[this.orderLineTableSortKey!]
            ? 1
            : -1
          : b[this.orderLineTableSortKey!] > a[this.orderLineTableSortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayOrderLines = data;
    }
  }

  orderTableCheckAll(value: boolean): void {
    this.listOfDisplayOrders.forEach(item => (this.orderTableMapOfCheckedId[item.id] = value));
    this.refreshOrderTableStatus();
  }

  refreshOrderTableStatus(): void {
    this.orderTableAllChecked = this.listOfDisplayOrders.every(item => this.orderTableMapOfCheckedId[item.id]);
    this.orderTableIndeterminate =
      this.listOfDisplayOrders.some(item => this.orderTableMapOfCheckedId[item.id]) && !this.orderTableAllChecked;
  }

  orderLineTableCheckAll(value: boolean): void {
    this.listOfDisplayOrderLines.forEach(item => (this.orderLineTableMapOfCheckedId[item.id] = value));
    this.refreshOrderLineTableStatus();
  }

  refreshOrderLineTableStatus(): void {
    this.orderLineTableAllChecked = this.listOfDisplayOrderLines.every(
      item => this.orderLineTableMapOfCheckedId[item.id],
    );
    this.orderLineTableIndeterminate =
      this.listOfDisplayOrderLines.some(item => this.orderLineTableMapOfCheckedId[item.id]) &&
      !this.orderLineTableAllChecked;
  }

  createWaveWithOrders() {
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
      if (this.orderTableMapOfCheckedId[order.id] === true) {
        selectedOrders.push(order);
      }
    });
    return selectedOrders;
  }

  createWaveWithOrderLines() {
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
      if (this.orderLineTableMapOfCheckedId[orderLine.id] === true) {
        selectedOrderLines.push(orderLine);
      }
    });
    return selectedOrderLines;
  }

  setWaveNumber(waveNumber: string) {
    this.searchForm.controls.waveNumber.setValue(waveNumber);
  }
}
