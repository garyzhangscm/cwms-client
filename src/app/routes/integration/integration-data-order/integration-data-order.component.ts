import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-integration-integration-data-order',
  templateUrl: './integration-data-order.component.html',
})
export class IntegrationIntegrationDataOrderComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
