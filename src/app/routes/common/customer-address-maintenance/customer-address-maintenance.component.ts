import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Customer } from '../models/customer';
import { Router } from '@angular/router';
import { I18NService } from '@core';

@Component({
  selector: 'app-common-customer-address-maintenance',
  templateUrl: './customer-address-maintenance.component.html',
})
export class CommonCustomerAddressMaintenanceComponent implements OnInit {
  currentCustomer: Customer;
  pageTitle: string;

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit() {
    this.loadCustomerFromSessionStorage();
    this.setupPageTitle();
  }

  loadCustomerFromSessionStorage() {
    this.currentCustomer = JSON.parse(sessionStorage.getItem('customer-maintenance.customer'));
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.customer-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.customer-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('customer-maintenance.customer', JSON.stringify(this.currentCustomer));
    const url = '/common/customer-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number) {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/customer-maintenance');
        break;
      case 2:
        this.router.navigateByUrl('/common/customer-maintenance/confirm');
        break;
      default:
        this.router.navigateByUrl('/common/customer-maintenance/address');
        break;
    }
  }
}
