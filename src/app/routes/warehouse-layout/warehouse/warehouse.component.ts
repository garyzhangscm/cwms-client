import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { I18NService } from '@core';

@Component({
  selector: 'app-warehouse-layout-warehouse',
  templateUrl: './warehouse.component.html',
})
export class WarehouseLayoutWarehouseComponent implements OnInit {
  warehouses: Warehouse[];

  currentWarehouse: Warehouse;

  emptyWarehouse: Warehouse = {
    id: null,
    name: '',
    size: null,
    address: '',
  };

  // Modal related
  isModalVisible = false;

  // Edit form on modal
  // warehouseForm: FormGroup;

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private modalService: NzModalService,
    private i18n: I18NService,
  ) {}

  ngOnInit() {
    this.listWarehouses();
    this.currentWarehouse = this.emptyWarehouse;
  }

  listWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe((res: Warehouse[]) => {
      console.log('Get warehouse res: ' + JSON.stringify(res));
      this.warehouses = res;
      console.log('Get warehouse: ' + JSON.stringify(this.warehouses));
    });
  }

  addWarehouse(): void {
    this.showModal(this.emptyWarehouse);
  }
  changeWarehouse(warehouse: Warehouse) {
    this.showModal(warehouse);
  }

  removeWarehouse(warehouse: Warehouse) {
    this.modalService.confirm({
      nzTitle: this.i18n.fanyi('page.warehouse.modal.delete.header.title'),
      nzContent: this.i18n.fanyi('page.warehouse.modal.delete.content'),
      nzOkText: this.i18n.fanyi('description.field.button.confirm'),
      nzOkType: 'danger',
      nzOnOk: () =>
        this.warehouseService.removeWarehouse(warehouse).subscribe(removedWarehouse => {
          console.log(JSON.stringify(removedWarehouse));
          this.listWarehouses();
        }),
      nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  showModal(warehouse?: Warehouse): void {
    this.isModalVisible = true;
    this.currentWarehouse = warehouse;
  }

  handleOk(): void {
    this.isModalVisible = false;
    console.log(JSON.stringify(this.currentWarehouse));
    if (this.currentWarehouse.id === undefined || this.currentWarehouse.id === null) {
      this.warehouseService.addWarehouse(this.currentWarehouse).subscribe(warehouse => {
        console.log('added: ' + warehouse);
        this.listWarehouses();
      });
    } else {
      this.warehouseService.changeWarehouse(this.currentWarehouse).subscribe(warehouse => {
        console.log('warehouse changed to: ' + warehouse);
        this.listWarehouses();
      });
    }
  }

  handleCancel(): void {
    this.isModalVisible = false;
    this.listWarehouses();
  }

  submitWarehouseForm(): void {}
}
