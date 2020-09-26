import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationCustomerData } from '../models/integration-customer-data';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { IntegrationCustomerDataService } from '../services/integration-customer-data.service';
import { CustomerService } from '../../common/services/customer.service';
import { I18NService } from '@core';
import { Customer } from '../../common/models/customer';
import { IntegrationClientData } from '../models/integration-client-data';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-integration-integration-data-customer',
  templateUrl: './integration-data-customer.component.html',
  styleUrls: ['./integration-data-customer.component.less'],
})
export class IntegrationIntegrationDataCustomerComponent implements OnInit {
  // Select control for clients and item families
  customers: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationCustomerData: IntegrationCustomerData[] = [];
  listOfDisplayIntegrationCustomerData: IntegrationCustomerData[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  integrationDataModal: NzModalRef;
  integrationDataForm: FormGroup;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationCustomerDataService: IntegrationCustomerDataService,
    private customerService: CustomerService,

    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationCustomerData = [];
    this.listOfDisplayIntegrationCustomerData = [];
  }
  search(integrationCustomerDataId?: number): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationCustomerDataService.getCustomerData(integrationCustomerDataId).subscribe(
      integrationCustomerDataRes => {
        this.listOfAllIntegrationCustomerData = integrationCustomerDataRes;
        this.listOfDisplayIntegrationCustomerData = integrationCustomerDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationCustomerDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationCustomerData[]): void {
    this.listOfDisplayIntegrationCustomerData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationCustomerData = this.listOfAllIntegrationCustomerData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationCustomerData = this.listOfAllIntegrationCustomerData;
    }
  }

  ngOnInit() {
    this.initSearchForm();
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedCustomers: [null],

      integrationDateTimeRanger: [null],
      integrationDate: [null],
    });

    // initiate the select control
    this.customerService.loadCustomers().subscribe((customerList: Customer[]) => {
      customerList.forEach(customer =>
        this.customers.push({ label: customer.description, value: customer.id.toString() }),
      );
    });
  }

  openAddIntegrationDataModal(
    tplIntegrationDataModalTitle: TemplateRef<{}>,
    tplIntegrationDataModalContent: TemplateRef<{}>,
  ) {
    this.integrationDataForm = this.fb.group({
      name: [null],
      description: [null],
      contactorFirstname: [null],
      contactorLastname: [null],
      addressCountry: [null],
      addressState: [null],
      addressCounty: [null],
      addressCity: [null],
      addressDistrict: [null],
      addressLine1: [null],
      addressLine2: [null],
      addressPostcode: [null],
    });

    this.integrationDataModal = this.modalService.create({
      nzTitle: tplIntegrationDataModalTitle,
      nzContent: tplIntegrationDataModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.integrationDataModal.destroy();
      },
      nzOnOk: () => {
        this.createIntegrationData(this.integrationDataForm.value);
      },

      nzWidth: 1000,
    });
  }
  createIntegrationData(customerData: IntegrationCustomerData) {
    console.log(`start to add integration data: ${JSON.stringify(customerData)}`);

    this.integrationCustomerDataService.addCustomerData(customerData).subscribe(integrationCustomerDataRes => {
      this.search(integrationCustomerDataRes.id);
    });
  }
}
