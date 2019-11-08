import { Component, OnInit } from '@angular/core';
import { TitleService } from '@delon/theme';
import { Warehouse } from '../models/warehouse';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../services/warehouse.service';
import { I18NService } from '@core';

@Component({
  selector: 'app-warehouse-layout-warehouse-maintenance',
  templateUrl: './warehouse-maintenance.component.html',
})
export class WarehouseLayoutWarehouseMaintenanceComponent implements OnInit {
  currentWarehouse: Warehouse;
  pageTitle: string;

  emptyWarehouse: Warehouse = {
    id: null,
    name: '',
    size: null,
    addressLine1: '',
    addressLine2: '',
    addressCountry: '',
    addressState: '',
    addressCounty: '',
    addressCity: '',
    addressStreet: '',
    addressPostcode: '',
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private warehouseService: WarehouseService,
    private i18n: I18NService,
    private titleService: TitleService,
  ) {
    this.currentWarehouse = this.emptyWarehouse;
    titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.header.title'));
    this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.header.title');
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      // We are in process of adding / changing a warehouse
      // and we already fill in all the information. Let's
      // load the changed warehouse from session storage
      let warehouseLoaded = false;
      if (params.inprocess === 'true') {
        warehouseLoaded = this.loadWarehouseFromSessionStorage();
      }

      // load from web server
      if (!warehouseLoaded) {
        this.loadWarehouseFromServer(this.activatedRoute.snapshot.params.id);
      }

      // setup page title
      // New: when we create a new warehouse
      // Modify: When we modify a existing warehouse
      this.setupPageTitle();
    });
  }

  loadWarehouseFromSessionStorage(): boolean {
    this.currentWarehouse = JSON.parse(sessionStorage.getItem('warehouse-maintenance.warehouse'));
    if (this.currentWarehouse.name === undefined) {
      return false;
    }
    return true;
  }

  loadWarehouseFromServer(warehouseId: string) {
    if (warehouseId !== undefined) {
      this.warehouseService.getWarehouse(+warehouseId).subscribe((warehouse: Warehouse) => {
        this.currentWarehouse = warehouse;
      });
    }
  }

  setupPageTitle() {
    if (this.currentWarehouse.id === undefined) {
      this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.add.header.title'));
      this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.add.header.title');
    } else {
      this.titleService.setTitle(this.i18n.fanyi('page.warehouse-maintenance.modify.header.title'));
      this.pageTitle = this.i18n.fanyi('page.warehouse-maintenance.modify.header.title');
    }
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('warehouse-maintenance.warehouse', JSON.stringify(this.currentWarehouse));
    const url = '/warehouse-layout/warehouse-maintenance/' + this.currentWarehouse.id + '/confirm';
    this.router.navigateByUrl(url);
  }
}
