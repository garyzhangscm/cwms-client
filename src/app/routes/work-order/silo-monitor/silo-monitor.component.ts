import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { SiloDevice } from '../models/silo-device';
import { SiloService } from '../services/silo.service';

@Component({
    selector: 'app-work-order-silo-monitor',
    templateUrl: './silo-monitor.component.html',
    standalone: false
})
export class WorkOrderSiloMonitorComponent implements OnInit {

  siloeDevices: SiloDevice[] = [];
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("locationName"), index: 'LOCATION_NAME' },    
    { title: this.i18n.fanyi("name"), index: 'NAME' },   
    { title: this.i18n.fanyi("deviceId"), index: 'DEVICE_ID' },   
    { title: this.i18n.fanyi("material"), render: "itemColumn" },   
    { title: this.i18n.fanyi("distance"), index: 'DISTANCE' , type: "number"},   
    { title: this.i18n.fanyi("timeStamp"), index: 'SMU_TIMESTAMP', type: "date"},     
    { title: this.i18n.fanyi("statusCode"), index: 'STATUS_CDE' },     
  ];
  
  
  displayOnly = false;
  constructor(
    private siloService: SiloService, 
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { 
      userService.isCurrentPageDisplayOnly("/work-order/silo").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                        
    }

  ngOnInit(): void { 


    this.isSpinning = true;
    this.siloService.getSiloDevices().subscribe({
      next: (res) => { 
        this.siloeDevices = res;        
        this.isSpinning = false;
      },
      error: () => this.isSpinning = false
    })
  }

}
