import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-integration-integration-data-order-confirm',
  templateUrl: './integration-data-order-confirm.component.html',
})
export class IntegrationIntegrationDataOrderConfirmComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
