import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service'; 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcConfiguration } from '../models/qc-configuration';
import { QcConfigurationService } from '../services/qc-configuration.service';

@Component({
  selector: 'app-qc-qc-configuration',
  templateUrl: './qc-configuration.component.html',
})
export class QcQcConfigurationComponent implements OnInit {
  currentQcConfiguration: QcConfiguration | undefined;

  availableInventoryStatuses: InventoryStatus[] = [];

  displayOnly = false;
  constructor( 
    private qcConfigurationService: QcConfigurationService,
    private warehouseService: WarehouseService,
    private inventoryStatusService: InventoryStatusService,
    private messageService: NzMessageService,
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) {

      userService.isCurrentPageDisplayOnly("/qc/configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                              
      
    this.currentQcConfiguration = {
 
      warehouseId: warehouseService.getCurrentWarehouse().id,
      qcPassInventoryStatus: { 
        name: "",
        description: "",
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
      },
      qcFailInventoryStatus: { 
        name: "",
        description: "",
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
      },
      
    }

    qcConfigurationService.getQcConfiguration().subscribe(
      {
        next: (qcConfiguration) => {
          if (qcConfiguration) {

            this.currentQcConfiguration = qcConfiguration;
          }
        }
      });
      
  }
 
  ngOnInit(): void {
      this.loadAvailableInventoryStatus();
   }

   loadAvailableInventoryStatus() {
     this.inventoryStatusService.loadInventoryStatuses().subscribe({
       next: (inventoryStatuses) => {
         this.availableInventoryStatuses = inventoryStatuses
       }
     })
   }
  saveConfiguration(): void {
    this.qcConfigurationService.saveQcConfiguration(this.currentQcConfiguration!).subscribe(
      res => {

        this.messageService.success(this.i18n.fanyi('message.save.complete'));
      }
    )
  }
  qcPassInventoryStatusChange() {
    let inventoryStatus  = this.availableInventoryStatuses.find(
          inventoryStatus => inventoryStatus.id === this.currentQcConfiguration!.qcPassInventoryStatus.id
        );
    if (inventoryStatus) {
      this.currentQcConfiguration!.qcPassInventoryStatus = inventoryStatus
    }
  }
  
  qcFailInventoryStatusChange() {
    let inventoryStatus  = this.availableInventoryStatuses.find(
          inventoryStatus => inventoryStatus.id === this.currentQcConfiguration!.qcFailInventoryStatus.id
        );
    if (inventoryStatus) {
      this.currentQcConfiguration!.qcFailInventoryStatus = inventoryStatus
    }
  }
}
