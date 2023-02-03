import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventorySnapshotConfiguration } from '../models/inventory-snapshot-configuration';
import { InventorySnapshotConfigurationService } from '../services/inventory-snapshot-configuration.service';
import { InventorySnapshotService } from '../services/inventory-snapshot.service';

@Component({
  selector: 'app-inventory-inventory-snapshot-configuration',
  templateUrl: './inventory-snapshot-configuration.component.html',
  styleUrls: ['./inventory-snapshot-configuration.component.less'],
})
export class InventoryInventorySnapshotConfigurationComponent implements OnInit {

  configurationForm!: FormGroup;
  isSpinning = false;
  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private inventorySnapshotService: InventorySnapshotService,
    private message: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private inventorySnapshotConfigurationService: InventorySnapshotConfigurationService,
    private fb: FormBuilder,) { }

  ngOnInit(): void {
    this.configurationForm = this.fb.group({
      cron: [null],
      locationUtilizationCron: [null],
    });

    this.inventorySnapshotConfigurationService
      .getInventorySnapshotConfiguration()
      .subscribe(inventorySnapshotConfiguration => {
        if (inventorySnapshotConfiguration) {

          this.configurationForm.controls.cron.setValue(
            inventorySnapshotConfiguration.cron);
          this.configurationForm.controls.locationUtilizationCron.setValue(
              inventorySnapshotConfiguration.locationUtilizationSnapshotCron);
        }
      })

  }

  saveConfiguration(): void {
    const inventorySnapshotConfiguration: InventorySnapshotConfiguration =
    {
      id: undefined,
      cron: this.configurationForm.controls.cron.value,
      locationUtilizationSnapshotCron:  this.configurationForm.controls.locationUtilizationCron.value,
      warehouseId: this.warehouseService.getCurrentWarehouse().id


    }

    this.isSpinning= true;
    this.inventorySnapshotConfigurationService
      .updateInventorySnapshotConfiguration(inventorySnapshotConfiguration)
      .subscribe({
        next: (inventorySnapshotConfiguration) => {

          this.message.info(this.i18n.fanyi('message.save.complete'));
          this.isSpinning= false;
        }, 
        error: () => this.isSpinning = false

      }); 
  }
  generateInventorySnapshot(): void {
    this.isSpinning = true;
    this.inventorySnapshotService
      .generateInventorySnapshot()
      .subscribe(inventorySnapshot => {
        this.isSpinning = false;
        this.message.success(
          this.i18n.fanyi('inventory-snapshot.created.result', {
            batchNumber: inventorySnapshot.batchNumber
          })
        );

      },
        () => {

          this.isSpinning = false;
        })
  }


}
