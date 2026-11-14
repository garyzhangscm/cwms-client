import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-outbound-grid-maintenance',
    templateUrl: './grid-maintenance.component.html',
    standalone: false
})
export class OutboundGridMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
