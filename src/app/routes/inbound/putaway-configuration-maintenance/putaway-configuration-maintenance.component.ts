import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inbound-putaway-configuration-maintenance',
  templateUrl: './putaway-configuration-maintenance.component.html',
})
export class InboundPutawayConfigurationMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
