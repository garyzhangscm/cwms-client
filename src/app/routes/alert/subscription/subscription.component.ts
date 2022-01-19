import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-alert-subscription',
  templateUrl: './subscription.component.html',
})
export class AlertSubscriptionComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
