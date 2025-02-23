import { formatDate } from "@angular/common";
import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN,  _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from "../../auth/services/user.service";
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionShiftSchedule } from "../models/production-shift-schedule";
import { WorkOrderConfiguration } from '../models/work-order-configuration';
import { WorkOrderMaterialConsumeTiming } from '../models/work-order-material-consume-timing';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';


@Component({
    selector: 'app-work-order-work-order-configuration',
    templateUrl: './work-order-configuration.component.html',
    standalone: false
})
export class WorkOrderWorkOrderConfigurationComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  workOrderMaterialConsumeTimings = WorkOrderMaterialConsumeTiming;
  workOrderMaterialConsumeTimingsKeys = Object.keys(this.workOrderMaterialConsumeTimings);

  
  currentWorkOrderConfiguration: WorkOrderConfiguration | undefined; 

  isSpinning = false;

  displayOnly = false;
  constructor( 
    private workOrderConfigurationService: WorkOrderConfigurationService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    private userService: UserService,
    private companyService: CompanyService,) {
      userService.isCurrentPageDisplayOnly("/work-order/work-order-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );
      
    this.currentWorkOrderConfiguration = {

      companyId: companyService.getCurrentCompany()!.id,
      warehouseId: warehouseService.getCurrentWarehouse().id,
      materialConsumeTiming: WorkOrderMaterialConsumeTiming.BY_TRANSACTION,
  
      overConsumeIsAllowed: false,
      overProduceIsAllowed: false,
      autoRecordItemProductivity: true,
      productionShiftSchedules: [],
    }
    workOrderConfigurationService.getWorkOrderConfiguration().subscribe(
      {
        next: (configuration) => 
          {
            if (configuration) {    
                this.currentWorkOrderConfiguration = configuration;
                this.currentWorkOrderConfiguration.companyId = companyService.getCurrentCompany()!.id;
                this.currentWorkOrderConfiguration.warehouseId = warehouseService.getCurrentWarehouse().id;
                configuration.productionShiftSchedules.forEach(
                  productionShiftSchedule =>
                      this.setupShiftStartAndEndDateTime(productionShiftSchedule)
                )
            }
          }
      });
      
  }
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void { }

  
  saveConfiguration(): void {
    this.isSpinning = true;
    this.setupShiftStartAndEndTime();
    this.workOrderConfigurationService.saveWorkOrderConfiguration(this.currentWorkOrderConfiguration!).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
      }, 
      error: () =>  this.isSpinning = false
    });  
  }
  setupShiftStartAndEndTime() {
    // convert the data time into a string of time only format with HH:mm:ss
    this.currentWorkOrderConfiguration?.productionShiftSchedules.forEach(
      productionShiftSchedule => {
        productionShiftSchedule.shiftStartTime = formatDate(
          productionShiftSchedule.shiftStartDateTime!, "HH:mm:ss", "en-US"
        );
        productionShiftSchedule.shiftEndTime = formatDate(
          productionShiftSchedule.shiftEndDateTime!, "HH:mm:ss", "en-US"
        );
      }
    )
  }
  
  setupShiftStartAndEndDateTime(productionShiftSchedule: ProductionShiftSchedule) {

    // convert the shift start and end time from string to date, 
    // date will be today's date
      
    productionShiftSchedule.shiftStartDateTime = new Date(`1990-01-01 ${productionShiftSchedule.shiftStartTime}`);
    productionShiftSchedule.shiftEndDateTime = new Date(`1990-01-01 ${productionShiftSchedule.shiftEndTime}`);

  }

  removeShiftSchedule(index: number) {
    console.log(`will remove the shift from index ${index}`);
    this.currentWorkOrderConfiguration?.productionShiftSchedules.splice(index, 1);
  }

  addShiftSchedule() {
    var currentTime = new Date();

    currentTime.setMinutes(0, 0, 0);

    this.currentWorkOrderConfiguration!.productionShiftSchedules = [
      ...this.currentWorkOrderConfiguration!.productionShiftSchedules,
      {        
          warehouseId: this.warehouseService.getCurrentWarehouse().id,      
          shiftStartDateTime: currentTime,   
          shiftEndDateTime: currentTime,  
          shiftEndNextDay: false,
      }
    ]
  }

}

