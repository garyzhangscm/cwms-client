import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { LightMesService } from '../services/light-mes.service';

@Component({
  selector: 'app-work-order-light-mes-status-dashboard',
  templateUrl: './light-mes-status-dashboard.component.html',
})
export class WorkOrderLightMesStatusDashboardComponent implements OnInit {

  constructor(private http: _HttpClient, 
    private lightMESService: LightMesService) { }

  ngOnInit(): void {
    this.lightMESService.getMachineList().subscribe({
      next: (machines) => {
        console.log(`get ${machines.length} machines`);
        machines.forEach(
          machine => {
            console.log(`machine ${machine.machineNo}: mid - ${machine.mid}, sim - ${machine.sim}, status - ${machine.status}`);
          }
        )
      }
    })
   }

}
