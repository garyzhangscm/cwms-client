import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { LightMesConfiguration } from '../models/light-mes-configuration';
import { Machine } from '../models/machine';
import { LightMesConfigurationService } from '../services/light-mes-configuration.service';
import { LightMesService } from '../services/light-mes.service';

@Component({
  selector: 'app-work-order-light-mes-status-dashboard',
  templateUrl: './light-mes-status-dashboard.component.html',
})
export class WorkOrderLightMesStatusDashboardComponent implements OnInit {
  lightMESConfiguration?: LightMesConfiguration;
  machines?: Machine[] = [];
  isSpinning = false;

  gridStyle = {
    width: '10%',
    textAlign: 'center'
  };


  constructor(private http: _HttpClient, 
    private lightMESService: LightMesService, 
    private lightMESConfigurationService: LightMesConfigurationService) { 
      lightMESConfigurationService.getLightMesConfiguration().subscribe({
        next: (lightMESConfigurationRes) => this.lightMESConfiguration = lightMESConfigurationRes
      });
    }

  ngOnInit(): void {
    this.isSpinning = true;
    this.lightMESService.getMachineStatus().subscribe({
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
    })
   }

   getBodyStyle(machine: Machine) {
    // 三色灯状态码：001-绿灯，010-黄灯，100-红灯，000-关灯
    
    switch(machine.currentState) {
      case '001':
        return  {'background-color': 'green'} ; 
      case '010':
        return  {'background-color': 'yellow'} ; 
      case '100':
        return  {'background-color': 'red'} ; 
      case '000':
        return  {'background-color': 'grey'} ;  

    }
    return {'background-color': 'white'} ; 
   }

}
