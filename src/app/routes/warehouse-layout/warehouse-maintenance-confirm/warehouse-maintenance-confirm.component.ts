import { Component, OnInit } from '@angular/core';
import { TitleService } from '@delon/theme';
import { Warehouse } from '../models/warehouse';
import { I18NService } from '@core';
import { WarehouseService } from '../services/warehouse.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-warehouse-layout-warehouse-maintenance-confirm',
  templateUrl: './warehouse-maintenance-confirm.component.html',
})
export class WarehouseLayoutWarehouseMaintenanceConfirmComponent implements OnInit {
  currentWarehouse: Warehouse;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.warehouse-maintenance.confirm.header.title');
  }

  ngOnInit() {
    this.currentWarehouse = JSON.parse(sessionStorage.getItem('warehouse-maintenance.warehouse'));
    this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.confirm.header.title'));
  }

  saveWarehouse() {
    if (this.currentWarehouse.id === undefined) {
      this.warehouseService
        .addWarehouse(this.currentWarehouse)
        .subscribe(res => this.router.navigateByUrl('/warehouse-layout/warehouse'));
    } else {
      this.warehouseService
        .changeWarehouse(this.currentWarehouse)
        .subscribe(res => this.router.navigateByUrl('/warehouse-layout/warehouse'));
    }
  }
  onStepIndexChange() {
    if (this.currentWarehouse.id === undefined) {
      this.router.navigateByUrl('/warehouse-layout/warehouse-maintenance?inprocess=true');
    } else {
      this.router.navigateByUrl(
        '/warehouse-layout/warehouse-maintenance/' + this.currentWarehouse.id + '?inprocess=true',
      );
    }
  }
}
