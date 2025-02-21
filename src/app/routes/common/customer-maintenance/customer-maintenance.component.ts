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
    standalone: false
})
export class CommonCustomerMaintenanceComponent implements OnInit {
  currentCustomer!: Customer;
  pageTitle = '';

  isWalmart = false;
  isTarget = false;

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
    
    customerIsTarget: false,
    customerIsWalmart: false,

    allowPrintShippingCartonLabel: false,
    allowPrintShippingCartonLabelWithPalletLabel: false,
    allowPrintShippingCartonLabelWithPalletLabelWhenShort: false,

    maxPalletSize:0,
    maxPalletHeight:0,
  };

  constructor(private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private titleService: TitleService, 
    private companyService: CompanyService) {
      this.currentCustomer = this.emptyCustomer;
  }

  ngOnInit(): void {
    this.loadCustomerFromSessionStorage();
    this.setupPageTitle();
    this.isWalmart = this.currentCustomer.customerIsWalmart == null ? false : this.currentCustomer.customerIsWalmart;
    this.isTarget = this.currentCustomer.customerIsTarget == null ? false : this.currentCustomer.customerIsTarget;
  }

  loadCustomerFromSessionStorage(): void {
    this.currentCustomer =
      sessionStorage.getItem('customer-maintenance.customer') === null
        ? this.emptyCustomer
        : JSON.parse(sessionStorage.getItem('customer-maintenance.customer')!);
  }

  setupPageTitle(): void {
    if (this.currentCustomer?.id) {
      
      this.titleService.setTitle(this.i18n.fanyi('modify'));
      this.pageTitle = this.i18n.fanyi('modify');
    }
    else {

      this.titleService.setTitle(this.i18n.fanyi('new'));
      this.pageTitle = this.i18n.fanyi('new');
    }
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
  
  // help function to change the local value so that when the user choose the
  // customer is target, then the user won't be able to choose if the user
  // is walmart at the same time
  isTargetSelectedChange(val: boolean) {
       this.isTarget = val;
       if (this.isTarget) {
        this.isWalmart = false;
        this.currentCustomer.customerIsWalmart = false;
       }
  }
  isWalmartSelectedChange(val: boolean) {
       this.isWalmart = val;
       if (this.isWalmart) {
        this.isTarget = false;
        this.currentCustomer.customerIsTarget = false;
       }
  }
}
