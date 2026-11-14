import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-alert-subscription-maintenance',
    templateUrl: './subscription-maintenance.component.html',
    standalone: false
})
export class AlertSubscriptionMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
