import { Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';

@Component({
  selector: 'app-warehouse-layout-warehouse',
  templateUrl: './warehouse.component.html',
})
export class WarehouseLayoutWarehouseComponent implements OnInit {
  warehouses: Warehouse[] = [];
  // Edit form on modal
  // warehouseForm: FormGroup;

  constructor(
    private warehouseService: WarehouseService,
    private modalService: NzModalService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  ngOnInit(): void {
    this.listWarehouses();
  }

  listWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe((res: Warehouse[]) => {
      this.warehouses = res;
    });
  }

  removeWarehouse(warehouse: Warehouse): void {
    this.modalService.confirm({
      nzTitle: this.i18n.fanyi('page.warehouse.modal.delete.header.title'),
      nzContent: this.i18n.fanyi('page.warehouse.modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkDanger: true,
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
