import { formatDate } from "@angular/common";
import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderConfiguration } from '../models/work-order-configuration';
import { WorkOrderMaterialConsumeTiming } from '../models/work-order-material-consume-timing';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';


@Component({
  selector: 'app-work-order-work-order-configuration',
  templateUrl: './work-order-configuration.component.html',
})
export class WorkOrderWorkOrderConfigurationComponent implements OnInit {

  workOrderMaterialConsumeTimings = WorkOrderMaterialConsumeTiming;

  
  currentWorkOrderConfiguration: WorkOrderConfiguration | undefined; 

  constructor(private http: _HttpClient,
    private workOrderConfigurationService: WorkOrderConfigurationService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private companyService: CompanyService) {
    this.currentWorkOrderConfiguration = {

      companyId: companyService.getCurrentCompany()!.id,
      warehouseId: warehouseService.getCurrentWarehouse().id,
      materialConsumeTiming: WorkOrderMaterialConsumeTiming.BY_TRANSACTION,
  
      overConsumeIsAllowed: false,
      overProduceIsAllowed: false,
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
            }
          }
      });
      
  }
  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void { }

  
  saveConfiguration(): void {
    this.setupShiftStartAndEndTime();
    this.workOrderConfigurationService.saveWorkOrderConfiguration(this.currentWorkOrderConfiguration!).subscribe(
      res => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
      }
    )
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

