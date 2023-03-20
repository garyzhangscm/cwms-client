import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
 
import { SiloDevice } from '../models/silo-device';
import { SiloService } from '../services/silo.service';

@Component({
  selector: 'app-work-order-silo-monitor',
  templateUrl: './silo-monitor.component.html',
})
export class WorkOrderSiloMonitorComponent implements OnInit {

  siloeDevices: SiloDevice[] = [];

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
  
  
  constructor(private http: _HttpClient, 
    private siloService: SiloService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { }

  ngOnInit(): void { 


    this.siloService.getSiloDevices().subscribe({
      next: (res) => this.siloeDevices = res,
      error: (error) => console.log(`error when request silo information\n ${error}`)
    })
  }

}
