import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Supplier } from '../models/supplier';

@Component({
  selector: 'app-common-supplier-address-maintenance',
  templateUrl: './supplier-address-maintenance.component.html',
})
export class CommonSupplierAddressMaintenanceComponent implements OnInit {
  currentSupplier: Supplier | undefined;
  pageTitle = '';

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit(): void {
    this.loadSupplierFromSessionStorage();
    this.setupPageTitle();
  }

  loadSupplierFromSessionStorage(): void {
    this.currentSupplier = JSON.parse(sessionStorage.getItem('supplier-maintenance.supplier')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.supplier-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.supplier-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('supplier-maintenance.supplier', JSON.stringify(this.currentSupplier));
    const url = '/common/supplier-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number): void {
    switch (event) {
      case 0:
        this.router.navigateByUrl('/common/supplier-maintenance');
        break;
      case 2:
        this.router.navigateByUrl('/common/supplier-maintenance/confirm');
        break;
      default:
        this.router.navigateByUrl('/common/supplier-maintenance/address');
        break;
    }
  }
}
