import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ReceiptService } from '../../inbound/services/receipt.service';
import { Receipt } from '../../inbound/models/receipt';
import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { ReceiptStatus } from '../../inbound/models/receipt-status.enum';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order';
import { Customer } from '../../common/models/customer';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-outbound-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less'],
})
export class OutboundOrderComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private orderService: OrderService,
    private message: NzMessageService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllOrders: Order[] = [];
  listOfDisplayOrders: Order[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByShipToCustomer = [];
  filtersByBillToCustomer = [];
  // Save filters that already selected
  selectedFiltersByBillToCustomer: string[] = [];
  selectedFiltersByShipToCustomer: string[] = [];

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllOrders = [];
    this.listOfDisplayOrders = [];
    this.filtersByShipToCustomer = [];
    this.filtersByBillToCustomer = [];
    this.selectedFiltersByBillToCustomer = [];
    this.selectedFiltersByShipToCustomer = [];
  }

  search(): void {
    this.orderService.getOrders(this.searchForm.controls.number.value).subscribe(orderRes => {
      this.listOfAllOrders = this.calculateQuantities(orderRes);
      this.listOfDisplayOrders = this.calculateQuantities(orderRes);

      this.filtersByShipToCustomer = [];
      this.filtersByBillToCustomer = [];
      const existingShipToCustomer = new Set();
      const existingBillToCustomer = new Set();

      this.listOfAllOrders.forEach(order => {
        const shipToCustomerName = order.shipToCustomer
          ? order.shipToCustomer.name
          : `${order.shipToContactorFirstname} ${order.shipToContactorLastname}`;

        if (!existingShipToCustomer.has(shipToCustomerName)) {
          this.filtersByShipToCustomer.push({ text: shipToCustomerName, value: shipToCustomerName });
          existingShipToCustomer.add(shipToCustomerName);
        }
        const billToCustomerName = order.billToCustomer
          ? order.billToCustomer.name
          : `${order.billToContactorFirstname} ${order.billToContactorLastname}`;

        if (!existingBillToCustomer.has(billToCustomerName)) {
          this.filtersByBillToCustomer.push({ text: billToCustomerName, value: billToCustomerName });
          existingBillToCustomer.add(billToCustomerName);
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
      order.totalShippedQuantity = 0;

      order.orderLines.forEach(orderLine => {
        order.totalExpectedQuantity += orderLine.expectedQuantity;
        order.totalShippedQuantity += orderLine.shippedQuantity;
        if (!existingItemIds.has(orderLine.item.id)) {
          existingItemIds.add(orderLine.item.id);
        }
      });
      order.totalItemCount = existingItemIds.size;
    });
    return orders;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayOrders.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayOrders.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayOrders.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByBillToCustomer: string[], selectedFiltersByShipToCustomer: string[]) {
    this.selectedFiltersByShipToCustomer = selectedFiltersByShipToCustomer;
    this.selectedFiltersByBillToCustomer = selectedFiltersByBillToCustomer;
    this.sortAndFilter();
  }

  sortAndFilter() {
    // filter data
    const filterFunc = (item: {
      shipToCustomer: Customer;
      billToCustomer: Customer;
      shipToContactorFirstname: string;
      shipToContactorLastname: string;
      billToContactorFirstname: string;
      billToContactorLastname: string;
    }) =>
      this.selectedFiltersByShipToCustomer.length
        ? this.selectedFiltersByShipToCustomer.some(shipToCustomerName => {
            if (item.shipToCustomer) {
              return item.shipToCustomer.name === shipToCustomerName;
            } else {
              return item.shipToContactorFirstname + ' ' + item.shipToContactorLastname === shipToCustomerName;
            }
          })
        : true && this.selectedFiltersByBillToCustomer.length
        ? this.selectedFiltersByBillToCustomer.some(billToCustomerName => {
            if (item.billToCustomer) {
              return item.billToCustomer.name === billToCustomerName;
            } else {
              return item.billToContactorFirstname + ' ' + item.billToContactorLastname === billToCustomerName;
            }
          })
        : true;

    const data = this.listOfAllOrders.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayOrders = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayOrders = data;
    }
  }

  removeSelectedOrders(): void {
    // make sure we have at least one checkbox checked
    const selectedOrders = this.getSelectedOrders();
    if (selectedOrders.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.orderService.removeOrders(selectedOrders).subscribe(res => {
            console.log('selected order removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedOrders(): Order[] {
    const selectedOrders: Order[] = [];
    this.listOfAllOrders.forEach((order: Order) => {
      if (this.mapOfCheckedId[order.id] === true) {
        selectedOrders.push(order);
      }
    });
    return selectedOrders;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });
  }
}
