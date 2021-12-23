import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inbound-customer-return',
  templateUrl: './customer-return.component.html',
})
export class InboundCustomerReturnComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
