import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Supplier } from '../models/supplier';
import { SupplierService } from '../services/supplier.service';

@Component({
    selector: 'app-common-supplier-maintenance-confirm',
    templateUrl: './supplier-maintenance-confirm.component.html',
    standalone: false
})
export class CommonSupplierMaintenanceConfirmComponent implements OnInit {
  currentSupplier: Supplier | undefined;

  pageTitle: string;
  isSpinning = false;

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private supplierService: SupplierService,
    private messageService: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('confirm');
  }

  ngOnInit(): void {
    this.currentSupplier = JSON.parse(sessionStorage.getItem('supplier-maintenance.supplier')!);
    this.titleService.setTitle(this.i18n.fanyi('confirm'));
  }

  save(): void {
    this.isSpinning = true;
    this.supplierService
      .addSupplier(this.currentSupplier!)
      .subscribe({
        next: (supplierRes) => {
          
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/common/supplier?name=${supplierRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
  }
  onStepIndexChange(event: number): void {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/supplier-maintenance');
        break;
      case 1:
        this.router.navigateByUrl('/common/supplier-maintenance/address');
        break;
      default:
        this.router.navigateByUrl('/common/supplier-maintenance/confirm');
        break;
    }
  }
}
