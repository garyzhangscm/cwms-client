import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Customer } from '../../common/models/customer';
import { CustomerService } from '../../common/services/customer.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationClientData } from '../models/integration-client-data';
import { IntegrationCustomerData } from '../models/integration-customer-data';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationCustomerDataService } from '../services/integration-customer-data.service';

@Component({
    selector: 'app-integration-integration-data-customer',
    templateUrl: './integration-data-customer.component.html',
    styleUrls: ['./integration-data-customer.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataCustomerComponent implements OnInit {
  listOfColumns: Array<ColumnItem<IntegrationCustomerData>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.id - b.id,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
    {
          name: 'name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.name.localeCompare(b.name),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        
    {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null, 
      showFilter: false
    },
    {
          name: 'contactor.firstname',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.contactorFirstname.localeCompare(b.contactorFirstname),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
              name: 'contactor.lastname',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.contactorLastname.localeCompare(b.contactorLastname),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'country',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressCountry.localeCompare(b.addressCountry),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'state',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressState.localeCompare(b.addressState),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'county',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressCounty!.localeCompare(b.addressCounty!),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'city',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressCity.localeCompare(b.addressCity),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'district',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressDistrict!.localeCompare(b.addressDistrict!),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'line1',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressLine1.localeCompare(b.addressLine1),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'line2',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressLine2!.localeCompare(b.addressLine2!),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'postcode',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.addressPostcode.localeCompare(b.addressPostcode),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.status',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => a.status.localeCompare(b.status),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.insertTime',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => differenceInMilliseconds(b.insertTime, a.insertTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.lastUpdateTime',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationCustomerData, b: IntegrationCustomerData) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            }, 
        ];

  // Select control for clients and item families
  customers: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationCustomerData: IntegrationCustomerData[] = [];
  listOfDisplayIntegrationCustomerData: IntegrationCustomerData[] = []; 

  isCollapse = false;

  integrationDataModal!: NzModalRef;
  integrationDataForm!: UntypedFormGroup;
  isSpinning = false;
  integrationStatusList = IntegrationStatus;
  integrationStatusListKeys = Object.keys(this.integrationStatusList);

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private integrationCustomerDataService: IntegrationCustomerDataService,
    private customerService: CustomerService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private utilService: UtilService,
    private messageService: NzMessageService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationCustomerData = [];
    this.listOfDisplayIntegrationCustomerData = [];
  }
  search(): void {
    this.searching = true;
  
    this.isSpinning = true;
    this.searchResult = '';
    
    let startTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.integrationDateTimeRanger.value ? 
        this.searchForm.value.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.integrationDate.value;

    this.integrationCustomerDataService.getData(startTime, endTime, specificDate, 
      this.searchForm.value.statusList.value,
      this.searchForm.value.id.value,).subscribe(
      integrationCustomerDataRes => {
        this.listOfAllIntegrationCustomerData = integrationCustomerDataRes;
        this.listOfDisplayIntegrationCustomerData = integrationCustomerDataRes;
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationCustomerDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  currentPageDataChange($event: IntegrationCustomerData[]): void {
    this.listOfDisplayIntegrationCustomerData = $event;
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
      statusList: [null],
      id: [null]
    });

    // initiate the select control
    this.customerService.loadCustomers().subscribe((customerList: Customer[]) => {
      customerList.forEach(customer =>
        this.customers.push({ label: customer.description, value: customer.id!.toString() }),
      );
    });
  }
/**
 *  
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
 */

  resendIntegration(id: number) : void {
    this.integrationCustomerDataService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
