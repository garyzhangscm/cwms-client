import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';

import { Silo } from '../models/silo';
import { SiloService } from '../services/silo.service';

@Component({
  selector: 'app-work-order-silo-monitor',
  templateUrl: './silo-monitor.component.html',
})
export class WorkOrderSiloMonitorComponent implements OnInit {

  siloes: Silo[] = [];

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("MAX_VOLUME"), index: 'MAX_VOLUME' },    
    { title: this.i18n.fanyi("DISTANCE"), index: 'DISTANCE'  },   
    { title: this.i18n.fanyi("NAME"), index: 'NAME' },     
  ];
  
  
  constructor(private http: _HttpClient, 
    private siloService: SiloService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { }

  ngOnInit(): void { 


    this.siloService.getSiloInformation().subscribe({
      next: (res) => this.siloes = res,
      error: (error) => console.log(`error when request silo information\n ${error}`)
    })
  }

}
