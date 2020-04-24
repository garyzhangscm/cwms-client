import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-integration-integration-data-receipt-confirm',
  templateUrl: './integration-data-receipt-confirm.component.html',
})
export class IntegrationIntegrationDataReceiptConfirmComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
