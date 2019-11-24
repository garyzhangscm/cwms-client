import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Supplier } from '../models/supplier';
import { Router } from '@angular/router';
import { I18NService } from '@core';

@Component({
  selector: 'app-common-supplier-address-maintenance',
  templateUrl: './supplier-address-maintenance.component.html',
})
export class CommonSupplierAddressMaintenanceComponent implements OnInit {
  currentSupplier: Supplier;
  pageTitle: string;

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit() {
    this.loadSupplierFromSessionStorage();
    this.setupPageTitle();
  }

  loadSupplierFromSessionStorage() {
    this.currentSupplier = JSON.parse(sessionStorage.getItem('supplier-maintenance.supplier'));
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.supplier-maintenance.address.title'));
    this.pageTitle = this.i18n.fanyi('page.supplier-maintenance.address.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('supplier-maintenance.supplier', JSON.stringify(this.currentSupplier));
    const url = '/common/supplier-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
  onStepIndexChange(event: number) {
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
