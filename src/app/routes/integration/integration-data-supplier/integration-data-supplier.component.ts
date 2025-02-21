import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { differenceInMilliseconds } from 'date-fns';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationStatus } from '../models/integration-status.enum';
import { IntegrationSupplierData } from '../models/integration-supplier-data';
import { IntegrationSupplierDataService } from '../services/integration-supplier-data.service';

@Component({
    selector: 'app-integration-integration-data-supplier',
    templateUrl: './integration-data-supplier.component.html',
    styleUrls: ['./integration-data-supplier.component.less'],
    standalone: false
})
export class IntegrationIntegrationDataSupplierComponent implements OnInit {
  
  listOfColumns: Array<ColumnItem<IntegrationSupplierData>> = [    
    {
          name: 'id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.id - b.id,
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
          sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.name.localeCompare(b.name),
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
      sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.description.localeCompare(b.description),
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
          sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.contactorFirstname.localeCompare(b.contactorFirstname),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.contactorLastname.localeCompare(b.contactorLastname),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressCountry.localeCompare(b.addressCountry),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressState.localeCompare(b.addressState),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressCounty!.localeCompare(b.addressCounty!),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressCity.localeCompare(b.addressCity),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressDistrict!.localeCompare(b.addressDistrict!),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressLine1.localeCompare(b.addressLine1),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressLine2!.localeCompare(b.addressLine2!),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.addressPostcode.localeCompare(b.addressPostcode),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.status.localeCompare(b.status),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => differenceInMilliseconds(b.insertTime, a.insertTime),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => differenceInMilliseconds(b.lastUpdateTime, a.lastUpdateTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            }, 
        ];

  // Select control for clients and item families
  suppliers: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';
  isSpinning = false;

  // Table data for display
  listOfAllIntegrationSupplierData: IntegrationSupplierData[] = [];
  listOfDisplayIntegrationSupplierData: IntegrationSupplierData[] = []; 
  isCollapse = false;
  integrationStatusList = IntegrationStatus;

  integrationDataModal!: NzModalRef;
  integrationDataForm!: UntypedFormGroup;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private integrationSupplierDataService: IntegrationSupplierDataService,
    private supplierService: SupplierService,

    private utilService: UtilService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationSupplierData = [];
    this.listOfDisplayIntegrationSupplierData = [];
  }
  search(integrationSupplierDataId?: number): void {
    this.searching = true;
    this.searchResult = '';
    this.isSpinning = true;
    let startTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.integrationDateTimeRanger.value ? 
        this.searchForm.controls.integrationDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.integrationDate.value;
    this.integrationSupplierDataService
      .getData(startTime, endTime, specificDate, 
        this.searchForm.controls.statusList.value,
        this.searchForm.controls.id.value,)
      .subscribe(integrationSupplierDataRes => {
        this.listOfAllIntegrationSupplierData = integrationSupplierDataRes;
        this.listOfDisplayIntegrationSupplierData = integrationSupplierDataRes;
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationSupplierDataRes.length,
        });
      },
      () => {
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = '';
      }, );
  }

  currentPageDataChange($event: IntegrationSupplierData[]): void {
    this.listOfDisplayIntegrationSupplierData = $event;
  }
  

  ngOnInit(): void {
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedSuppliers: [null],

      integrationDateTimeRanger: [null],
      integrationDate: [null],
      statusList: [null],
      id: [null]
    });

    // initiate the select control
    this.supplierService.loadSuppliers().subscribe((supplierList: Supplier[]) => {
      supplierList.forEach(supplier =>
        this.suppliers.push({ label: supplier.description, value: supplier.id!.toString() }),
      );
    });
  }

  /***
   * 
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
  createIntegrationData(supplierData: IntegrationSupplierData): void {
    console.log(`start to add integration data: ${JSON.stringify(supplierData)}`);

    this.integrationSupplierDataService.addSupplierData(supplierData).subscribe(integrationSupplierDataRes => {
      this.search(integrationSupplierDataRes.id);
    });
  }
   * 
   */

  
  resendIntegration(id: number) : void {
    this.integrationSupplierDataService.resend(id).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    })

  }
}
