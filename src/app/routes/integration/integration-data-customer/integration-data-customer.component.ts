import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Customer } from '../../common/models/customer';
import { CustomerService } from '../../common/services/customer.service';
import { IntegrationClientData } from '../models/integration-client-data';
import { IntegrationCustomerData } from '../models/integration-customer-data';
import { IntegrationCustomerDataService } from '../services/integration-customer-data.service';

@Component({
  selector: 'app-integration-integration-data-customer',
  templateUrl: './integration-data-customer.component.html',
  styleUrls: ['./integration-data-customer.component.less'],
})
export class IntegrationIntegrationDataCustomerComponent implements OnInit {
  // Select control for clients and item families
  customers: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  // Form related data and functions
  searchForm!: FormGroup;

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

  integrationDataModal!: NzModalRef;
  integrationDataForm!: FormGroup;

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
  }

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm(): void {
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
  ): void {
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
  createIntegrationData(customerData: IntegrationCustomerData): void {
    console.log(`start to add integration data: ${JSON.stringify(customerData)}`);

    this.integrationCustomerDataService.addCustomerData(customerData).subscribe(integrationCustomerDataRes => {
      this.search(integrationCustomerDataRes.id);
    });
  }
}
