import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Customer } from '../models/customer';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-common-customer-maintenance-confirm',
  templateUrl: './customer-maintenance-confirm.component.html',
})
export class CommonCustomerMaintenanceConfirmComponent implements OnInit {
  currentCustomer: Customer | undefined;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private customerService: CustomerService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.customer-maintenance.confirm.title');
  }

  ngOnInit(): void {
    this.currentCustomer = JSON.parse(sessionStorage.getItem('customer-maintenance.customer')!);
    this.titleService.setTitle(this.i18n.fanyi('page.customer-maintenance.confirm.title'));
  }

  save(): void {
    this.customerService
      .addCustomer(this.currentCustomer!)
      .subscribe(res => this.router.navigateByUrl('/common/customer'));
  }
  onStepIndexChange(event: number): void {
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
