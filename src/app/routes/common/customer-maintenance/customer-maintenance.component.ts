import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Customer } from '../models/customer';

@Component({
  selector: 'app-common-customer-maintenance',
  templateUrl: './customer-maintenance.component.html',
})
export class CommonCustomerMaintenanceComponent implements OnInit {
  currentCustomer: Customer | undefined;
  pageTitle = '';

  emptyCustomer: Customer = {
    id: 0,
    name: '',
    description: '',
    warehouseId: this.warehouseService.getCurrentWarehouse().id,
    companyId: this.companyService.getCurrentCompany()!.id,
    contactorFirstname: '',
    contactorLastname: '',
    addressCountry: '',
    addressState: '',
    addressCounty: '',
    addressCity: '',
    addressDistrict: '',
    addressLine1: '',
    addressLine2: '',
    addressPostcode: '',
    listPickEnabledFlag: false,
  };

  constructor(private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private titleService: TitleService, 
    private companyService: CompanyService) { }

  ngOnInit(): void {
    this.loadCustomerFromSessionStorage();
    this.setupPageTitle();
  }

  loadCustomerFromSessionStorage(): void {
    this.currentCustomer =
      sessionStorage.getItem('customer-maintenance.customer') === null
        ? this.emptyCustomer
        : JSON.parse(sessionStorage.getItem('customer-maintenance.customer')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.add.title'));
    this.pageTitle = this.i18n.fanyi('page.add.title');
  }
  goToAddressPage(): void {
    sessionStorage.setItem('customer-maintenance.customer', JSON.stringify(this.currentCustomer));
    const url = '/common/customer-maintenance/address';
    this.router.navigateByUrl(url);
  }

  
  listPickEnabledFlagChanged(listPickEnabledFlagChecked : boolean)   {
    this.currentCustomer!.listPickEnabledFlag = listPickEnabledFlagChecked; 
    console.log(`listPickEnabledFlagChecked is changed to ${listPickEnabledFlagChecked}`);
    console.log(`this.currentCustomer!: ${JSON.stringify(this.currentCustomer!)}`);
  }
}
