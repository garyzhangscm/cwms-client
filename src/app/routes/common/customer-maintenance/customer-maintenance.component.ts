import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
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
}
