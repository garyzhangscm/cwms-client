import { Component, OnDestroy, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import * as moment from 'moment'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { interval, Subscription } from 'rxjs';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LightMesConfiguration } from '../models/light-mes-configuration';
import { Machine } from '../models/machine';
import { ProductionLineType } from '../models/production-line-type'; 
import { LightMesConfigurationService } from '../services/light-mes-configuration.service';
import { LightMesService } from '../services/light-mes.service';
import { ProductionLineTypeService } from '../services/production-line-type.service';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';

@Component({
    selector: 'app-work-order-light-mes-status-dashboard',
    templateUrl: './light-mes-status-dashboard.component.html',
    standalone: false
})
export class WorkOrderLightMesStatusDashboardComponent implements OnInit, OnDestroy {
  lightMESConfiguration?: LightMesConfiguration;
  productionLineType = "All";
  productionLineTypes: ProductionLineType[] = [];
  machines?: Machine[] = [];
  productionLineTypeLocalStorageKey = "light_mes_status_dashboard_production_line_key";
  refreshCountCycleLocalStorageKey = "light_mes_status_dashboard_refresh_cycle_key";
  isSpinning = false;

  // display height for each box, in px.
  // we will need to calculate it dynamicly since one machine may
  // have multiple item assigned
  // 1. if the machine allowed multiple items assigned at the same time
  // 2. the machine only allow one item at a time but within the shift, there
  //    was multiple items on the machine
  displayHeight: number = 150;

  gridStyle = {
    width: '12.5%',
    textAlign: 'center',
    padding: '2px'
  };
  
  // default to show 5 seconds per page
  refreshCountCycle = 60;
  countDownNumber = this.refreshCountCycle;
  countDownsubscription!: Subscription;
  loadingData = false;
  showConfiguration = false;

  // refresh and show the current time
  currentTime : string = "";
  currentTimesubscription!: Subscription;
  
  hoursSpentInThisShift: number = 0;

  currentShiftStartTime?: string;
  currentShiftEndTime?: string;
  shiftTimesubscription!: Subscription;
 

  constructor(private http: _HttpClient, 
    private lightMESService: LightMesService,  
    private messageService: NzMessageService,
    private dateTimeService: DateTimeService,
    private warehouseService: WarehouseService,
    private productionLineTypeService: ProductionLineTypeService,
    private workOrderConfigurationService: WorkOrderConfigurationService,
    private lightMESConfigurationService: LightMesConfigurationService) { 
      lightMESConfigurationService.getLightMesConfiguration().subscribe({
        next: (lightMESConfigurationRes) => this.lightMESConfiguration = lightMESConfigurationRes
      }); 
  }

  ngOnInit(): void {
      this.loadAvailableProductionLineTypes();
      
      this.currentTime =  this.dateTimeService.getCurrentTimeByWarehouseTimeZone().format("MM/DD/yyyy HH:mm:ss");

      if (localStorage.getItem(this.productionLineTypeLocalStorageKey)) {
        this.productionLineType = localStorage.getItem(this.productionLineTypeLocalStorageKey)!;
      }
      if (localStorage.getItem(this.refreshCountCycleLocalStorageKey)) { 
        this.refreshCountCycle = +localStorage.getItem(this.refreshCountCycleLocalStorageKey)!;
        this.countDownNumber = this.refreshCountCycle;
      }
    
      if (this.productionLineType == "All") {
        this.refresh();
      }
      else {
        this.refresh(this.productionLineType);
      }
      
      this.countDownsubscription = interval(1000).subscribe(x => {
        this.handleCountDownEvent();
      });
      this.currentTimesubscription = interval(1000).subscribe(x => {
        this.currentTime =  this.dateTimeService.getCurrentTimeByWarehouseTimeZone().format("MM/DD/yyyy HH:mm:ss");
      });

      this.workOrderConfigurationService.getCurrentShift().subscribe({
        next: (currentShiftRes) => {
            this.currentShiftStartTime = currentShiftRes.first;
            this.currentShiftEndTime = currentShiftRes.second;
          
            // get the different between now and the shift start 
            
            let start = this.dateTimeService.getTimeWithTimeZone(
              this.currentShiftStartTime!, 'MM/DD/YYYY HH:mm:ss', this.warehouseService.getCurrentWarehouse().timeZone!);
             
            let end = this.dateTimeService.getCurrentTimeByWarehouseTimeZone();
 
            this.hoursSpentInThisShift = end.diff(start) * 1.0 / (1000 * 60 * 60);
                 
        }
      });

      this.shiftTimesubscription = interval(60000).subscribe(x => { 
        this.workOrderConfigurationService.getCurrentShift().subscribe({
          next: (currentShiftRes) => {
            this.currentShiftStartTime = currentShiftRes.first;
            this.currentShiftEndTime = currentShiftRes.second;
                
            // get the different between now and the shift start 
            let start = this.dateTimeService.getTimeWithTimeZone(
              this.currentShiftStartTime!, 'MM/DD/YYYY HH:mm:ss', this.warehouseService.getCurrentWarehouse().timeZone!);
            let end = this.dateTimeService.getCurrentTimeByWarehouseTimeZone();
            
            this.hoursSpentInThisShift = end.diff(start) * 1.0 / (1000 * 60 * 60);
          }
        })
      });


   }

   loadAvailableProductionLineTypes() : void {
    this.productionLineTypeService.getProductionLineTypes().subscribe({
      next: (productionLineTypeRes) => this.productionLineTypes = productionLineTypeRes
    })
  }

   refresh(productionLineTypeName?: string) {
    this.isSpinning = true;
    this.lightMESService.getCurrentShiftMachineStatus(undefined, productionLineTypeName).subscribe({
      next: (machinesRes) => {
        // console.log(`get ${machinesRes.length} machines`);
        
        // machinesRes.forEach(
        //   machine => {
        //     console.log(`machine ${machine.machineNo} / ${machine.machineName}: mid - ${machine.mid}, sim - ${machine.sim}, status - ${machine.status}`);
        //   }
        // );
        this.machines = machinesRes;
        this.setDisplayHeight(this.machines);
        
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
   }

   setDisplayHeight(machines: Machine[]) {
    let maxItemCount = Math.max(...machines.map(machine => machine.machineStatistics.length));
    this.displayHeight = 150 + (maxItemCount - 1) * 35;
    console.log(`set height to ${this.displayHeight}`);
   }

   getBodyStyle(machine: Machine) {
    // 三色灯状态码：001-绿灯，010-黄灯，100-红灯，000-关灯
    
    switch(machine.currentState) {
      case '001':
        return  {'background-color': 'green', 'color': 'white', 'font-weight':'bold', 'height': `${this.displayHeight }px`} ; 
      case '010':
        return  {'background-color': 'yellow', 'font-weight':'bold', 'height': `${this.displayHeight }px`} ; 
      case '100':
        return  {'background-color': 'red', 'color': 'green', 'font-weight':'bold', 'height': `${this.displayHeight }px`} ; 
      case '000':
        return  {'background-color': 'grey', 'font-weight':'bold', 'height': `${this.displayHeight }px`} ;  

    }
    return {'background-color': 'white', 'font-weight':'bold', 'height': `${this.displayHeight }px`} ; 
   }

   
   handleCountDownEvent(): void {
     
    // don't count down when we are loading data
    if (this.loadingData) {
      
      this.resetCountDownNumber();
      return;
    }
    this.countDownNumber--;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();
      
      if (this.productionLineType == "All") {
        this.refresh();
      }
      else {

        this.refresh(this.productionLineType);
      }
    } 

  }
  resetCountDownNumber() {
    this.countDownNumber = this.refreshCountCycle;
  }
  
  ngOnDestroy() {
    this.countDownsubscription.unsubscribe();
    this.currentTimesubscription.unsubscribe();
    this.shiftTimesubscription.unsubscribe();


  }

  productionLineTypeChanged() {
    
    localStorage.setItem(this.productionLineTypeLocalStorageKey, this.productionLineType)
    if (this.productionLineType == "All") {
      this.refresh();
    }
    else {

      this.refresh(this.productionLineType);
    }

  }

  refreshCountCycleChanged() {
    
    localStorage.setItem(this.refreshCountCycleLocalStorageKey, this.refreshCountCycle.toString());
  }

}
