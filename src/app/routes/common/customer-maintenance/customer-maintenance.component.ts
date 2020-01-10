import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Customer } from '../models/customer';
import { Router } from '@angular/router';
import { I18NService } from '@core';

@Component({
  selector: 'app-common-customer-maintenance',
  templateUrl: './customer-maintenance.component.html',
})
export class CommonCustomerMaintenanceComponent implements OnInit {
  currentCustomer: Customer;
  pageTitle: string;

  emptyCustomer: Customer = {
    id: 0,
    name: '',
    description: '',
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
  };

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit() {
    this.loadCustomerFromSessionStorage();
    this.setupPageTitle();
  }

  loadCustomerFromSessionStorage() {
    this.currentCustomer =
      sessionStorage.getItem('customer-maintenance.customer') === null
        ? this.emptyCustomer
        : JSON.parse(sessionStorage.getItem('customer-maintenance.customer'));
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.add.title'));
    this.pageTitle = this.i18n.fanyi('page.add.title');
  }
  goToAddressPage(): void {
    sessionStorage.setItem('customer-maintenance.customer', JSON.stringify(this.currentCustomer));
    const url = '/common/customer-maintenance/address';
    this.router.navigateByUrl(url);
  }
}
