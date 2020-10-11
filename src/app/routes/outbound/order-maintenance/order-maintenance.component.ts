import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-outbound-order-maintenance',
  templateUrl: './order-maintenance.component.html',
})
export class OutboundOrderMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
