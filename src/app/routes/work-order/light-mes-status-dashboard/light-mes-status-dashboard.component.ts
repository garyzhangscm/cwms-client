import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 
import { interval, Subscription } from 'rxjs';

import { LightMesConfiguration } from '../models/light-mes-configuration';
import { Machine } from '../models/machine';
import { ProductionLineType } from '../models/production-line-type';
import { LightMesConfigurationService } from '../services/light-mes-configuration.service';
import { LightMesService } from '../services/light-mes.service';
import { ProductionLineTypeService } from '../services/production-line-type.service';

@Component({
  selector: 'app-work-order-light-mes-status-dashboard',
  templateUrl: './light-mes-status-dashboard.component.html',
})
export class WorkOrderLightMesStatusDashboardComponent implements OnInit, OnDestroy {
  lightMESConfiguration?: LightMesConfiguration;
  productionLineType = "All";
  productionLineTypes: ProductionLineType[] = [];
  machines?: Machine[] = [];
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
 

  constructor(private http: _HttpClient, 
    private lightMESService: LightMesService,  
    private messageService: NzMessageService,
    private productionLineTypeService: ProductionLineTypeService,
    private lightMESConfigurationService: LightMesConfigurationService) { 
      lightMESConfigurationService.getLightMesConfiguration().subscribe({
        next: (lightMESConfigurationRes) => this.lightMESConfiguration = lightMESConfigurationRes
      });
    }

  ngOnInit(): void {
    this.loadAvailableProductionLineTypes();
    this.refresh();
    this.countDownsubscription = interval(1000).subscribe(x => {
      this.handleCountDownEvent();
    })
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
        console.log(`get ${machinesRes.length} machines`);
        machinesRes.forEach(
          machine => {
            console.log(`machine ${machine.machineNo} / ${machine.machineName}: mid - ${machine.mid}, sim - ${machine.sim}, status - ${machine.status}`);
          }
        );
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
        return  {'background-color': 'green', 'color': 'white', 'font-weight':'bold'} ; 
      case '010':
        return  {'background-color': 'yellow', 'font-weight':'bold'} ; 
      case '100':
        return  {'background-color': 'red', 'color': 'green', 'font-weight':'bold'} ; 
      case '000':
        return  {'background-color': 'grey', 'font-weight':'bold'} ;  

    }
    return {'background-color': 'white', 'font-weight':'bold'} ; 
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

  }

  productionLineTypeChanged() {
    if (this.productionLineType == "All") {
      this.refresh();
    }
    else {

      this.refresh(this.productionLineType);
    }

  }

}
