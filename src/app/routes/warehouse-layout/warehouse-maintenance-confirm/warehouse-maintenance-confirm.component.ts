import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService } from '@delon/theme';

import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';

@Component({
  selector: 'app-warehouse-layout-warehouse-maintenance-confirm',
  templateUrl: './warehouse-maintenance-confirm.component.html',
})
export class WarehouseLayoutWarehouseMaintenanceConfirmComponent implements OnInit {
  currentWarehouse!: Warehouse;

  pageTitle: string;
  isSpinning = false;

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.warehouse-maintenance.confirm.header.title');
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
