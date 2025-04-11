import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ItemFamily } from '../models/item-family';

@Component({
    selector: 'app-inventory-item-family-maintenance',
    templateUrl: './item-family-maintenance.component.html',
    standalone: false
})
export class InventoryItemFamilyMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly warehouseService = inject(WarehouseService);
  private readonly companyService = inject(CompanyService);

   
  currentItemFamily!: ItemFamily;
  pageTitle = '';

  emptyItemFamily: ItemFamily = { 
    name: '',
    description: '',
    totalItemCount: 0,

    warehouseId: this.warehouseService.getCurrentWarehouse().id,
    companyId: this.companyService.getCurrentCompany()!.id,
  };

  constructor(
    private router: Router, 
    private titleService: TitleService,
  ) { }

  ngOnInit(): void {
    this.loadItemFamilyFromSessionStorage();
    this.setupPageTitle();
  }

  loadItemFamilyFromSessionStorage(): void {
    this.currentItemFamily =
      sessionStorage.getItem('item-family-maintenance.item-family') === null
        ? this.emptyItemFamily
        : JSON.parse(sessionStorage.getItem('item-family-maintenance.item-family')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.item-family-maintenance.add.title'));
    this.pageTitle = this.i18n.fanyi('page.item-family-maintenance.add.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('item-family-maintenance.item-family', JSON.stringify(this.currentItemFamily));
    const url = '/inventory/item-family-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
}
