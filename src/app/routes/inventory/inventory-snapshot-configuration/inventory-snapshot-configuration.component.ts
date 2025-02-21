import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventorySnapshotConfiguration } from '../models/inventory-snapshot-configuration';
import { InventoryAgingSnapshotService } from '../services/inventory-aging-snapshot.service';
import { InventorySnapshotConfigurationService } from '../services/inventory-snapshot-configuration.service';
import { InventorySnapshotService } from '../services/inventory-snapshot.service';
import { LocationUtilizationSnapshotBatchService } from '../services/location-utilization-snapshot-batch.service';

@Component({
    selector: 'app-inventory-inventory-snapshot-configuration',
    templateUrl: './inventory-snapshot-configuration.component.html',
    styleUrls: ['./inventory-snapshot-configuration.component.less'],
    standalone: false
})
export class InventoryInventorySnapshotConfigurationComponent implements OnInit {
  configurationForm!: UntypedFormGroup;
  isSpinning = false;
  hours : number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private inventorySnapshotService: InventorySnapshotService,
    private message: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private inventorySnapshotConfigurationService: InventorySnapshotConfigurationService,
    private locationUtilizationSnapshotBatchService: LocationUtilizationSnapshotBatchService,
    private inventoryAgingSnapshotService: InventoryAgingSnapshotService,
    private dateTimeService: DateTimeService,
    private fb: UntypedFormBuilder,) { }

  ngOnInit(): void {
    this.configurationForm = this.fb.group({ 
      inventorySnapshotTiming1: [null],
      inventorySnapshotTiming2: [null],
      inventorySnapshotTiming3: [null],

      locationUtilizationSnapshotTiming1: [null],
      locationUtilizationSnapshotTiming2: [null],
      locationUtilizationSnapshotTiming3: [null],
  
  
      inventoryAgingSnapshotTiming1: [null],
      inventoryAgingSnapshotTiming2: [null],
      inventoryAgingSnapshotTiming3: [null],
    });

    this.inventorySnapshotConfigurationService
      .getInventorySnapshotConfiguration()
      .subscribe(inventorySnapshotConfiguration => {
        if (inventorySnapshotConfiguration) {

          if (inventorySnapshotConfiguration.inventorySnapshotTiming1 != null)  {

            this.configurationForm.value.inventorySnapshotTiming1.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.inventorySnapshotTiming1));
          }
          if (inventorySnapshotConfiguration.inventorySnapshotTiming2 != null)  {

            this.configurationForm.value.inventorySnapshotTiming2.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.inventorySnapshotTiming2));
          }
          if (inventorySnapshotConfiguration.inventorySnapshotTiming3 != null)  {

            this.configurationForm.value.inventorySnapshotTiming3.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.inventorySnapshotTiming3));
          }

            
          if (inventorySnapshotConfiguration.locationUtilizationSnapshotTiming1 != null)  {
            this.configurationForm.value.locationUtilizationSnapshotTiming1.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.locationUtilizationSnapshotTiming1)); 
          }            
          if (inventorySnapshotConfiguration.locationUtilizationSnapshotTiming2 != null)  {
            this.configurationForm.value.locationUtilizationSnapshotTiming2.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.locationUtilizationSnapshotTiming2)); 
          }            
          if (inventorySnapshotConfiguration.locationUtilizationSnapshotTiming3 != null)  {
            this.configurationForm.value.locationUtilizationSnapshotTiming3.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.locationUtilizationSnapshotTiming3)); 
          }
             
          if (inventorySnapshotConfiguration.inventoryAgingSnapshotTiming1 != null)  {
            this.configurationForm.value.inventoryAgingSnapshotTiming1.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.inventoryAgingSnapshotTiming1)); 
          } 
          if (inventorySnapshotConfiguration.inventoryAgingSnapshotTiming2 != null)  {
            this.configurationForm.value.inventoryAgingSnapshotTiming2.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.inventoryAgingSnapshotTiming2)); 
          } 
          if (inventorySnapshotConfiguration.inventoryAgingSnapshotTiming3 != null)  {
            this.configurationForm.value.inventoryAgingSnapshotTiming3.setValue(
              this.dateTimeService.getLocalHour(inventorySnapshotConfiguration.inventoryAgingSnapshotTiming3)); 
          } 
        }
      })

  }

  saveConfiguration(): void {
    // before we save, we should convert the hours to UTC
    let  inventorySnapshotTiming1 = this.configurationForm.value.inventorySnapshotTiming1.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.inventorySnapshotTiming1.value);
    let  inventorySnapshotTiming2 = this.configurationForm.value.inventorySnapshotTiming2.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.inventorySnapshotTiming2.value);          
    let  inventorySnapshotTiming3 = this.configurationForm.value.inventorySnapshotTiming3.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.inventorySnapshotTiming3.value);


    let  locationUtilizationSnapshotTiming1 = this.configurationForm.value.locationUtilizationSnapshotTiming1.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.locationUtilizationSnapshotTiming1.value);
    let  locationUtilizationSnapshotTiming2 = this.configurationForm.value.locationUtilizationSnapshotTiming2.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.locationUtilizationSnapshotTiming2.value);          
    let  locationUtilizationSnapshotTiming3 = this.configurationForm.value.locationUtilizationSnapshotTiming3.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.locationUtilizationSnapshotTiming3.value);
 

    let  inventoryAgingSnapshotTiming1 = this.configurationForm.value.inventoryAgingSnapshotTiming1.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.inventoryAgingSnapshotTiming1.value);
    let  inventoryAgingSnapshotTiming2 = this.configurationForm.value.inventoryAgingSnapshotTiming2.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.inventoryAgingSnapshotTiming2.value);          
    let  inventoryAgingSnapshotTiming3 = this.configurationForm.value.inventoryAgingSnapshotTiming3.value == null ?
          undefined : this.dateTimeService.getUTCHour(this.configurationForm.value.inventoryAgingSnapshotTiming3.value); 

          
    const inventorySnapshotConfiguration: InventorySnapshotConfiguration =
    { 
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

      inventorySnapshotTiming1: inventorySnapshotTiming1,
      inventorySnapshotTiming2: inventorySnapshotTiming2,
      inventorySnapshotTiming3: inventorySnapshotTiming3,

      locationUtilizationSnapshotTiming1: locationUtilizationSnapshotTiming1,
      locationUtilizationSnapshotTiming2: locationUtilizationSnapshotTiming2,
      locationUtilizationSnapshotTiming3: locationUtilizationSnapshotTiming3,
  
  
      inventoryAgingSnapshotTiming1: inventoryAgingSnapshotTiming1,
      inventoryAgingSnapshotTiming2: inventoryAgingSnapshotTiming2,
      inventoryAgingSnapshotTiming3: inventoryAgingSnapshotTiming3,

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

  
  generateLocationUtilizationSnapshotBatch() {

    this.isSpinning = true;
    this.locationUtilizationSnapshotBatchService.generateLocationUtilizationSnapshotBatch()
    .subscribe({
      next: (locationUtilizationSnapshotBatch) => { 
        this.isSpinning = false; 
        this.message.success(
          this.i18n.fanyi('location-utilization-snapshot.created.result', {
            batchNumber: locationUtilizationSnapshotBatch.number
          })
        );
      } ,
      error: () => this.isSpinning = false
    })
  }

  generateInventoryAgingSnapshotBatch() {
    this.isSpinning = true;
    this.inventoryAgingSnapshotService.generateInventoryAgingSnapshot()
    .subscribe({
      next: (inventoryAgingSnapshotBatch) => { 
        this.isSpinning = false; 
        this.message.success(
          this.i18n.fanyi('inventory-aging-snapshot.created.result', {
            batchNumber: inventoryAgingSnapshotBatch.number
          })
        );
      } ,
      error: () => this.isSpinning = false
    })
  }
}
