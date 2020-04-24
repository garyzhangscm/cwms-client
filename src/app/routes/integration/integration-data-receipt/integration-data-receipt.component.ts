import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-integration-integration-data-receipt',
  templateUrl: './integration-data-receipt.component.html',
})
export class IntegrationIntegrationDataReceiptComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
