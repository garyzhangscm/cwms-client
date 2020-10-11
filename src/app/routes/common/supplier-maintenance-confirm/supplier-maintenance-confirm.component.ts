import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Supplier } from '../models/supplier';
import { SupplierService } from '../services/supplier.service';

@Component({
  selector: 'app-common-supplier-maintenance-confirm',
  templateUrl: './supplier-maintenance-confirm.component.html',
})
export class CommonSupplierMaintenanceConfirmComponent implements OnInit {
  currentSupplier: Supplier | undefined;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private supplierService: SupplierService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.supplier-maintenance.confirm.title');
  }

  ngOnInit(): void {
    this.currentSupplier = JSON.parse(sessionStorage.getItem('supplier-maintenance.supplier')!);
    this.titleService.setTitle(this.i18n.fanyi('page.supplier-maintenance.confirm.title'));
  }

  save(): void {
    this.supplierService
      .addSupplier(this.currentSupplier!)
      .subscribe(res => this.router.navigateByUrl('/common/supplier'));
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
