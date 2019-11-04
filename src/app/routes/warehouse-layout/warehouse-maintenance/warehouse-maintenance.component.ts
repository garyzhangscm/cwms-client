import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Warehouse } from '../models/warehouse';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { WarehouseService } from '../services/warehouse.service';
import { Observable } from 'rxjs';
import { I18NService } from '@core';

@Component({
  selector: 'app-warehouse-layout-warehouse-maintenance',
  templateUrl: './warehouse-maintenance.component.html',
})
export class WarehouseLayoutWarehouseMaintenanceComponent implements OnInit {
  currentWarehouse: Warehouse;
  pageTitle: string;
  warehouseId: string;

  emptyWarehouse: Warehouse = {
    id: null,
    name: '',
    size: null,
    address: '',
  };

  constructor(
    private http: _HttpClient,
    private route: ActivatedRoute,
    private warehouseService: WarehouseService,
    private i18n: I18NService,
  ) {
    this.currentWarehouse = this.emptyWarehouse;
    this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.header.title');
  }

  ngOnInit() {
    /***
    this.warehouse$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.warehouseService.getWarehouse(+params.get('id'))),
    );
    this.warehouse$.subscribe((result: Warehouse) => { 
      this.currentWarehouse = result;
    });
    ***/
    this.warehouseId = this.route.snapshot.params.id;
    if (this.warehouseId !== undefined) {
      this.warehouseService.getWarehouse(+this.warehouseId).subscribe((warehouse: Warehouse) => {
        this.currentWarehouse = warehouse;
        this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.modify.header.title');
      });
    } else {
      this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.add.header.title');
    }
    /*
    this.route.paramMap
      .pipe(switchMap((params: ParamMap) => this.warehouseService.getWarehouse(+params.get('id'))))
      .subscribe((result: Warehouse) => {
        this.currentWarehouse = result;
        if (result.id === undefined) {
          this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.add.header.title');
        } else {
          this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.modify.header.title');
        }
      });
      */
  }
}
