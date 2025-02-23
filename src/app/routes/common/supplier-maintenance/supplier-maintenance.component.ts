import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Supplier } from '../models/supplier';

@Component({
    selector: 'app-common-supplier-maintenance',
    templateUrl: './supplier-maintenance.component.html',
    standalone: false
})
export class CommonSupplierMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly warehouseService = inject(WarehouseService);
  private readonly companyService = inject(CompanyService);
  currentSupplier: Supplier | undefined;
  pageTitle = '';

  emptySupplier: Supplier = {
    id: 0,
    name: '',
    warehouseId: this.warehouseService.getCurrentWarehouse().id,
    companyId: this.companyService.getCurrentCompany()!.id,
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

  constructor(private router: Router, 
    private titleService: TitleService, ) { }

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
