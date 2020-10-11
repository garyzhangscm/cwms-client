import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { IntegrationItemData } from '../models/integration-item-data';
import { IntegrationItemUnitOfMeasureData } from '../models/integration-item-unit-of-measure-data';
import { IntegrationOrder } from '../models/integration-order';
import { IntegrationItemDataService } from '../services/integration-item-data.service';
import { IntegrationItemUnitOfMeasureDataService } from '../services/integration-item-unit-of-measure-data.service';
import { IntegrationOrderService } from '../services/integration-order.service';

@Component({
  selector: 'app-integration-integration-data-order',
  templateUrl: './integration-data-order.component.html',
  styleUrls: ['./integration-data-order.component.less'],
})
export class IntegrationIntegrationDataOrderComponent implements OnInit {
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

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

  constructor(
    private fb: FormBuilder,
    private integrationOrderService: IntegrationOrderService,
    private i18n: I18NService,
  ) {}
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
    this.searchResult = '';
    this.integrationOrderService.getData().subscribe(
      integrationOrderRes => {
        this.listOfAllIntegrationOrders = integrationOrderRes;
        this.listOfDisplayIntegrationOrders = integrationOrderRes;

        this.filtersByShipToCustomer = [];
        this.filtersByBillToCustomer = [];
        const existingShipToCustomer = new Set();
        const existingBillToCustomer = new Set();

         

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationOrderRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationOrder[]): void {
    this.listOfDisplayIntegrationOrders = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByBillToCustomer: string[], selectedFiltersByShipToCustomer: string[]): void {
    this.selectedFiltersByShipToCustomer = selectedFiltersByShipToCustomer;
    this.selectedFiltersByBillToCustomer = selectedFiltersByBillToCustomer;
    this.sortAndFilter();
  }

  sortAndFilter(): void {
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
 
  }

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });
  }
}
