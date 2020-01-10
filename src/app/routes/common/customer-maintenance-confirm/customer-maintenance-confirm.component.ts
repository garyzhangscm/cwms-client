import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Customer } from '../models/customer';
import { I18NService } from '@core';
import { CustomerService } from '../services/customer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-common-customer-maintenance-confirm',
  templateUrl: './customer-maintenance-confirm.component.html',
})
export class CommonCustomerMaintenanceConfirmComponent implements OnInit {
  currentCustomer: Customer;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private customerService: CustomerService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.customer-maintenance.confirm.title');
  }

  ngOnInit() {
    this.currentCustomer = JSON.parse(sessionStorage.getItem('customer-maintenance.customer'));
    this.titleService.setTitle(this.i18n.fanyi('page.customer-maintenance.confirm.title'));
  }

  save() {
    this.customerService
      .addCustomer(this.currentCustomer)
      .subscribe(res => this.router.navigateByUrl('/common/customer'));
  }
  onStepIndexChange(event: number) {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/customer-maintenance');
        break;
      case 1:
        this.router.navigateByUrl('/common/customer-maintenance/address');
        break;
      default:
        this.router.navigateByUrl('/common/customer-maintenance/confirm');
        break;
    }
  }
}
