import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Supplier } from '../models/supplier';

@Component({
  selector: 'app-common-supplier-maintenance',
  templateUrl: './supplier-maintenance.component.html',
})
export class CommonSupplierMaintenanceComponent implements OnInit {
  currentSupplier: Supplier | undefined;
  pageTitle = '';

  emptySupplier: Supplier = {
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
    this.loadSupplierFromSessionStorage();
    this.setupPageTitle();
  }

  loadSupplierFromSessionStorage(): void {
    this.currentSupplier =
      sessionStorage.getItem('supplier-maintenance.supplier') === null
        ? this.emptySupplier
        : JSON.parse(sessionStorage.getItem('supplier-maintenance.supplier')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.add.title'));
    this.pageTitle = this.i18n.fanyi('page.add.title');
  }
  goToAddressPage(): void {
    sessionStorage.setItem('supplier-maintenance.supplier', JSON.stringify(this.currentSupplier));
    const url = '/common/supplier-maintenance/address';
    this.router.navigateByUrl(url);
  }
}
