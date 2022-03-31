import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-billing-invoice-maintenance',
  templateUrl: './invoice-maintenance.component.html',
})
export class BillingInvoiceMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
