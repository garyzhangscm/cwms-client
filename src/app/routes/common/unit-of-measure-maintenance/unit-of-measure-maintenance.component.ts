import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { UnitOfMeasure } from '../models/unit-of-measure';

@Component({
    selector: 'app-common-unit-of-measure-maintenance',
    templateUrl: './unit-of-measure-maintenance.component.html',
    standalone: false
})
export class CommonUnitOfMeasureMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentUnitOfMeasure: UnitOfMeasure | undefined;
  pageTitle = '';

  emptyUnitOfMeasure: UnitOfMeasure = {
    id: 0,
    name: '',
    description: '',
    warehouseId: this.warehouseService.getCurrentWarehouse().id,
    companyId: this.companyService.getCurrentCompany()!.id
  };

  constructor(private router: Router, 
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private titleService: TitleService) { }

  ngOnInit(): void {
    this.loadUnitOfMeasureFromSessionStorage();
    this.setupPageTitle();
  }

  loadUnitOfMeasureFromSessionStorage(): void {
    this.currentUnitOfMeasure =
      sessionStorage.getItem('unit-of-measure-maintenance.unit-of-measure') === null
        ? this.emptyUnitOfMeasure
        : JSON.parse(sessionStorage.getItem('unit-of-measure-maintenance.unit-of-measure')!);
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.unit-of-measure-maintenance.add.title'));
    this.pageTitle = this.i18n.fanyi('page.unit-of-measure-maintenance.add.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('unit-of-measure-maintenance.unit-of-measure', JSON.stringify(this.currentUnitOfMeasure));
    const url = '/inventory/unit-of-measure/confirm';
    this.router.navigateByUrl(url);
  }
}
