import { Component,  inject, OnInit,  } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';


import { UserService } from '../../auth/services/user.service';
import { Warehouse } from '../models/warehouse';
import { WarehouseService } from '../services/warehouse.service';
 

@Component({
    selector: 'app-warehouse-layout-warehouse',
    templateUrl: './warehouse.component.html',
    standalone: false
})
export class WarehouseLayoutWarehouseComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  warehouses: Warehouse[] = [];
  isSpinning = false;
  // Edit form on modal
  // warehouseForm: FormGroup;

  displayOnly = false;
  constructor(
    private warehouseService: WarehouseService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/warehouse-layout/warehouse").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                              
  }

  ngOnInit(): void {
    this.listWarehouses();
  }

  listWarehouses(): void {
    this.warehouseService.getWarehouses().subscribe((res: Warehouse[]) => {
      this.warehouses = res;
    });
  }

  removeWarehouse(warehouse: Warehouse): void {

    // we are not allow the user to remove the current login warehouse
    if (warehouse.id === this.warehouseService.getCurrentWarehouse().id) {
      this.message.create('error', `Cannot remove current login warehouse, please login other warehouse first`);
    }
    else {

      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.warehouse.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.warehouse.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () =>
          {
            this.isSpinning = true;
            this.warehouseService.removeWarehouse(warehouse).subscribe(
              removedWarehouse => {
                console.log(JSON.stringify(removedWarehouse));
                this.listWarehouses();
                this.isSpinning = false;
                // we will need to reload the page to reset the top dropdown list for warehouse
                
                window.location.reload();
              }, 
              () => this.isSpinning = false);
          }
          ,
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }
}
