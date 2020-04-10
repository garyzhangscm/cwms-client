import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationSupplierData } from '../models/integration-supplier-data';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { IntegrationSupplierDataService } from '../services/integration-supplier-data.service';
import { SupplierService } from '../../common/services/supplier.service';
import { I18NService } from '@core';
import { Customer } from '../../common/models/customer';
import { IntegrationCustomerData } from '../models/integration-customer-data';
import { Supplier } from '../../common/models/supplier';

@Component({
  selector: 'app-integration-integration-data-supplier',
  templateUrl: './integration-data-supplier.component.html',
  styleUrls: ['./integration-data-supplier.component.less'],
})
export class IntegrationIntegrationDataSupplierComponent implements OnInit {
  // Select control for clients and item families
  suppliers: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  searchForm: FormGroup;

  searching = false;

  // Table data for display
  listOfAllIntegrationSupplierData: IntegrationSupplierData[] = [];
  listOfDisplayIntegrationSupplierData: IntegrationSupplierData[] = [];
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
    private integrationSupplierDataService: IntegrationSupplierDataService,
    private supplierService: SupplierService,

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
    this.integrationSupplierDataService
      .getSupplierData(integrationSupplierDataId)
      .subscribe(integrationSupplierDataRes => {
        this.listOfAllIntegrationSupplierData = integrationSupplierDataRes;
        this.listOfDisplayIntegrationSupplierData = integrationSupplierDataRes;
        this.searching = false;
      });
  }

  currentPageDataChange($event: IntegrationSupplierData[]): void {
    this.listOfDisplayIntegrationSupplierData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationSupplierData = this.listOfAllIntegrationSupplierData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationSupplierData = this.listOfAllIntegrationSupplierData;
    }
  }

  ngOnInit() {
    this.initSearchForm();
  }

  initSearchForm() {
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
  createIntegrationData(supplierData: IntegrationSupplierData) {
    console.log(`start to add integration data: ${JSON.stringify(supplierData)}`);

    this.integrationSupplierDataService.addSupplierData(supplierData).subscribe(integrationSupplierDataRes => {
      this.search(integrationSupplierDataRes.id);
    });
  }
}
