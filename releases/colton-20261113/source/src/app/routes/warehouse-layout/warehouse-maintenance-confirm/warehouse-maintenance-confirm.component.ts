import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService } from '@delon/theme';

import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';

@Component({
    selector: 'app-warehouse-layout-warehouse-maintenance-confirm',
    templateUrl: './warehouse-maintenance-confirm.component.html',
    standalone: false
})
export class WarehouseLayoutWarehouseMaintenanceConfirmComponent implements OnInit {
  currentWarehouse!: Warehouse;
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  pageTitle: string;
  isSpinning = false;

  constructor(
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.confirm.header.title');
  }

  ngOnInit(): void {
    this.currentWarehouse = JSON.parse(sessionStorage.getItem('warehouse-maintenance.warehouse')!);
    this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.confirm.header.title'));
  }

  saveWarehouse(): void {
    this.isSpinning = true;
    if (this.currentWarehouse.id) {
      this.warehouseService
        .changeWarehouse(this.currentWarehouse)
        .subscribe(res => {
          this.isSpinning = false;
          this.router.navigateByUrl('/warehouse-layout/warehouse')
        }, 
        () => this.isSpinning = false);
    } else {
      this.warehouseService
        .addWarehouse(this.currentWarehouse)
        .subscribe(res => {
          this.isSpinning = false;
          this.router.navigateByUrl('/warehouse-layout/warehouse')
        }, 
        () => this.isSpinning = false);
    }
  }
  onStepIndexChange(): void {
    if (this.currentWarehouse.id) {
      this.router.navigateByUrl(
        `/warehouse-layout/warehouse-maintenance/${  this.currentWarehouse.id  }?inprocess=true`,
      );
    } else {
      this.router.navigateByUrl('/warehouse-layout/warehouse-maintenance?inprocess=true');
    }
  }
}
