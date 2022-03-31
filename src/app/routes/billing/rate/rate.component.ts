import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-billing-rate',
  templateUrl: './rate.component.html',
})
export class BillingRateComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
