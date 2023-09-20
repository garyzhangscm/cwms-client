import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { interval, Subscription } from 'rxjs';

import { LightMesConfiguration } from '../models/light-mes-configuration';
import { Machine } from '../models/machine';
import { ProductionLineType } from '../models/production-line-type';
import { WorkOrderConfiguration } from '../models/work-order-configuration';
import { LightMesConfigurationService } from '../services/light-mes-configuration.service';
import { LightMesService } from '../services/light-mes.service';
import { ProductionLineTypeService } from '../services/production-line-type.service';
import { WorkOrderConfigurationService } from '../services/work-order-configuration.service';

@Component({
  selector: 'app-work-order-light-mes-status-dashboard',
  templateUrl: './light-mes-status-dashboard.component.html',
})
export class WorkOrderLightMesStatusDashboardComponent implements OnInit, OnDestroy {
  lightMESConfiguration?: LightMesConfiguration;
  productionLineType = "All";
  productionLineTypes: ProductionLineType[] = [];
  machines?: Machine[] = [];
  productionLineTypeLocalStorageKey = "light_mes_status_dashboard_production_line_key";
  refreshCountCycleLocalStorageKey = "light_mes_status_dashboard_refresh_cycle_key";
  isSpinning = false;

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
  currentTime : any = new Date();
  currentTimesubscription!: Subscription;

  currentShiftStartTime?: string;
  currentShiftEndTime?: string;
  shiftTimesubscription!: Subscription;
 

  constructor(private http: _HttpClient, 
    private lightMESService: LightMesService,  
    private messageService: NzMessageService,
    private productionLineTypeService: ProductionLineTypeService,
    private workOrderConfigurationService: WorkOrderConfigurationService,
    private lightMESConfigurationService: LightMesConfigurationService) { 
      lightMESConfigurationService.getLightMesConfiguration().subscribe({
        next: (lightMESConfigurationRes) => this.lightMESConfiguration = lightMESConfigurationRes
      }); 
    }

  ngOnInit(): void {
      this.loadAvailableProductionLineTypes();
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
        this.currentTime = new Date(); 
      });

      this.workOrderConfigurationService.getCurrentShift().subscribe({
        next: (currentShiftRes) => {
          this.currentShiftStartTime = currentShiftRes.first;
          this.currentShiftEndTime = currentShiftRes.second;
          console.log(`current shift [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
        }
      });

      this.shiftTimesubscription = interval(60000).subscribe(x => { 
        this.workOrderConfigurationService.getCurrentShift().subscribe({
          next: (currentShiftRes) => {
                this.currentShiftStartTime = currentShiftRes.first;
                this.currentShiftEndTime = currentShiftRes.second;
                console.log(`current shift [${this.currentShiftStartTime}, ${this.currentShiftEndTime}]`);
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
    this.lightMESService.getMachineStatus(undefined, productionLineTypeName).subscribe({
      next: (machinesRes) => {
        // console.log(`get ${machinesRes.length} machines`);
        
        // machinesRes.forEach(
        //   machine => {
        //     console.log(`machine ${machine.machineNo} / ${machine.machineName}: mid - ${machine.mid}, sim - ${machine.sim}, status - ${machine.status}`);
        //   }
        // );
        this.machines = machinesRes;
        
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
   }

   getBodyStyle(machine: Machine) {
    // 三色灯状态码：001-绿灯，010-黄灯，100-红灯，000-关灯
    
    switch(machine.currentState) {
      case '001':
        return  {'background-color': 'green', 'color': 'white', 'font-weight':'bold', 'height': '150px'} ; 
      case '010':
        return  {'background-color': 'yellow', 'font-weight':'bold', 'height': '150px'} ; 
      case '100':
        return  {'background-color': 'red', 'color': 'green', 'font-weight':'bold', 'height': '150px'} ; 
      case '000':
        return  {'background-color': 'grey', 'font-weight':'bold', 'height': '150px'} ;  

    }
    return {'background-color': 'white', 'font-weight':'bold', 'height': '150px'} ; 
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
