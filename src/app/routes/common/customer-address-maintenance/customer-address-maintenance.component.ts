import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { Customer } from '../models/customer';

@Component({
  selector: 'app-common-customer-address-maintenance',
  templateUrl: './customer-address-maintenance.component.html',
})
export class CommonCustomerAddressMaintenanceComponent implements OnInit {
  currentCustomer: Customer | undefined;
  pageTitle = '';

  constructor(private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService) { }

  ngOnInit(): void {
    this.loadCustomerFromSessionStorage();
    this.setupPageTitle();
  }

  loadCustomerFromSessionStorage(): void {
    this.currentCustomer = JSON.parse(sessionStorage.getItem('customer-maintenance.customer')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.customer-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.customer-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('customer-maintenance.customer', JSON.stringify(this.currentCustomer));
    const url = '/common/customer-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number): void {
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
