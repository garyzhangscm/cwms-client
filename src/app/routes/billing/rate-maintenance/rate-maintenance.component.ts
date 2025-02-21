import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-billing-rate-maintenance',
    templateUrl: './rate-maintenance.component.html',
    standalone: false
})
export class BillingRateMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
