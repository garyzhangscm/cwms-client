import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationItemData } from '../models/integration-item-data';
import { IntegrationItemDataService } from '../services/integration-item-data.service';
import { IntegrationOrderService } from '../services/integration-order.service';
import { IntegrationOrder } from '../models/integration-order';
import { IntegrationItemUnitOfMeasureDataService } from '../services/integration-item-unit-of-measure-data.service';
import { IntegrationItemUnitOfMeasureData } from '../models/integration-item-unit-of-measure-data';

@Component({
  selector: 'app-integration-integration-data-order',
  templateUrl: './integration-data-order.component.html',
  styleUrls: ['./integration-data-order.component.less'],
})
export class IntegrationIntegrationDataOrderComponent implements OnInit {
  constructor(private fb: FormBuilder, private integrationOrderService: IntegrationOrderService) {}

  searchForm: FormGroup;

  searching = false;

  // Table data for display
  listOfAllIntegrationOrders: IntegrationOrder[] = [];
  listOfDisplayIntegrationOrders: IntegrationOrder[] = [];
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

  isCollapse = false;

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationOrders = [];
    this.listOfDisplayIntegrationOrders = [];

    this.filtersByShipToCustomer = [];
    this.filtersByBillToCustomer = [];
    this.selectedFiltersByBillToCustomer = [];
    this.selectedFiltersByShipToCustomer = [];
  }
  search(): void {
    this.searching = true;
    this.integrationOrderService.getData().subscribe(integrationOrderRes => {
      this.listOfAllIntegrationOrders = integrationOrderRes;
      this.listOfDisplayIntegrationOrders = integrationOrderRes;

      this.filtersByShipToCustomer = [];
      this.filtersByBillToCustomer = [];
      const existingShipToCustomer = new Set();
      const existingBillToCustomer = new Set();

      this.listOfAllIntegrationOrders.forEach(order => {
        const shipToCustomerName = order.shipToCustomerName
          ? order.shipToCustomerName
          : `${order.shipToContactorFirstname} ${order.shipToContactorLastname}`;

        if (!existingShipToCustomer.has(shipToCustomerName)) {
          this.filtersByShipToCustomer.push({ text: shipToCustomerName, value: shipToCustomerName });
          existingShipToCustomer.add(shipToCustomerName);
        }
        const billToCustomerName = order.billToCustomerName
          ? order.billToCustomerName
          : `${order.billToContactorFirstname} ${order.billToContactorLastname}`;

        if (!existingBillToCustomer.has(billToCustomerName)) {
          this.filtersByBillToCustomer.push({ text: billToCustomerName, value: billToCustomerName });
          existingBillToCustomer.add(billToCustomerName);
        }
      });

      this.searching = false;
    });
  }

  currentPageDataChange($event: IntegrationOrder[]): void {
    this.listOfDisplayIntegrationOrders = $event;
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
      shipToCustomerName: string;
      billToCustomerName: string;
      shipToContactorFirstname: string;
      shipToContactorLastname: string;
      billToContactorFirstname: string;
      billToContactorLastname: string;
    }) =>
      this.selectedFiltersByShipToCustomer.length
        ? this.selectedFiltersByShipToCustomer.some(shipToCustomerName => {
            if (item.shipToCustomerName) {
              return item.shipToCustomerName === shipToCustomerName;
            } else {
              return item.shipToContactorFirstname + ' ' + item.shipToContactorLastname === shipToCustomerName;
            }
          })
        : true && this.selectedFiltersByBillToCustomer.length
        ? this.selectedFiltersByBillToCustomer.some(billToCustomerName => {
            if (item.billToCustomerName) {
              return item.billToCustomerName === billToCustomerName;
            } else {
              return item.billToContactorFirstname + ' ' + item.billToContactorLastname === billToCustomerName;
            }
          })
        : true;

    const data = this.listOfAllIntegrationOrders.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationOrders = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationOrders = data;
    }
  }

  ngOnInit() {
    this.initSearchForm();
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });
  }
}
