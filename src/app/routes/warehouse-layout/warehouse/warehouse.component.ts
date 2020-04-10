import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';
import { NzModalService } from 'ng-zorro-antd';
import { I18NService } from '@core';

@Component({
  selector: 'app-warehouse-layout-warehouse',
  templateUrl: './warehouse.component.html',
})
export class WarehouseLayoutWarehouseComponent implements OnInit {
  warehouses: Warehouse[];
  // Edit form on modal
  // warehouseForm: FormGroup;

  constructor(
    private warehouseService: WarehouseService,
    private modalService: NzModalService,
    private i18n: I18NService,
  ) {}

  ngOnInit() {
    this.listWarehouses();
  }

  listWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe((res: Warehouse[]) => {
      this.warehouses = res;
    });
  }

  removeWarehouse(warehouse: Warehouse) {
    this.modalService.confirm({
      nzTitle: this.i18n.fanyi('page.warehouse.modal.delete.header.title'),
      nzContent: this.i18n.fanyi('page.warehouse.modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkType: 'danger',
      nzOnOk: () =>
        this.warehouseService.removeWarehouse(warehouse).subscribe(removedWarehouse => {
          console.log(JSON.stringify(removedWarehouse));
          this.listWarehouses();
        }),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzOnCancel: () => console.log('Cancel'),
    });
  }
}
