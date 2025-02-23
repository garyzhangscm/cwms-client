import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Customer } from '../models/customer';
import { CustomerService } from '../services/customer.service';

@Component({
    selector: 'app-common-customer-maintenance-confirm',
    templateUrl: './customer-maintenance-confirm.component.html',
    standalone: false
})
export class CommonCustomerMaintenanceConfirmComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentCustomer: Customer | undefined;

  pageTitle: string;
  isSpinning = false;

  constructor(
    private titleService: TitleService,
    private customerService: CustomerService,
    private messageService: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('confirm');
  }

  ngOnInit(): void {
    this.currentCustomer = JSON.parse(sessionStorage.getItem('customer-maintenance.customer')!);
    this.titleService.setTitle(this.i18n.fanyi('confirm'));
  }

  save(): void {
    this.isSpinning = true;
    this.customerService
      .addCustomer(this.currentCustomer!)
      .subscribe({
        next: () => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/common/customer?name=${this.currentCustomer?.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
         
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
