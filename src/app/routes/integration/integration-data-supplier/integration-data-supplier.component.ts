import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { IntegrationSupplierData } from '../models/integration-supplier-data';
import { IntegrationSupplierDataService } from '../services/integration-supplier-data.service';

@Component({
  selector: 'app-integration-integration-data-supplier',
  templateUrl: './integration-data-supplier.component.html',
  styleUrls: ['./integration-data-supplier.component.less'],
})
export class IntegrationIntegrationDataSupplierComponent implements OnInit {
  
  listOfColumns: ColumnItem[] = [    
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => this.utilService.compareDateTime(a.insertTime, b.insertTime),
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
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => this.utilService.compareDateTime(a.lastUpdateTime, b.lastUpdateTime),
              sortDirections: ['ascend', 'descend'],
              filterMultiple: true,
              listOfFilter: [],
              filterFn: null, 
              showFilter: false
            },
            {
              name: 'integration.errorMessage',
              showSort: true,
              sortOrder: null,
              sortFn: (a: IntegrationSupplierData, b: IntegrationSupplierData) => a.errorMessage.localeCompare(b.errorMessage),
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
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllIntegrationSupplierData: IntegrationSupplierData[] = [];
  listOfDisplayIntegrationSupplierData: IntegrationSupplierData[] = []; 
  isCollapse = false;

  integrationDataModal!: NzModalRef;
  integrationDataForm!: FormGroup;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationSupplierDataService: IntegrationSupplierDataService,
    private supplierService: SupplierService,

    private utilService: UtilService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationSupplierData = [];
    this.listOfDisplayIntegrationSupplierData = [];
  }
  search(integrationSupplierDataId?: number): void {
    this.searching = true;
    this.searchResult = '';
    this.integrationSupplierDataService
      .getSupplierData(integrationSupplierDataId)
      .subscribe(integrationSupplierDataRes => {
        this.listOfAllIntegrationSupplierData = integrationSupplierDataRes;
        this.listOfDisplayIntegrationSupplierData = integrationSupplierDataRes;
        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: integrationSupplierDataRes.length,
        });
      },
      () => {
        this.searching = false;
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
    });

    // initiate the select control
    this.supplierService.loadSuppliers().subscribe((supplierList: Supplier[]) => {
      supplierList.forEach(supplier =>
        this.suppliers.push({ label: supplier.description, value: supplier.id.toString() }),
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
  createIntegrationData(supplierData: IntegrationSupplierData): void {
    console.log(`start to add integration data: ${JSON.stringify(supplierData)}`);

    this.integrationSupplierDataService.addSupplierData(supplierData).subscribe(integrationSupplierDataRes => {
      this.search(integrationSupplierDataRes.id);
    });
  }
}
