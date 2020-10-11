import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inbound-receipt-confirm',
  templateUrl: './receipt-confirm.component.html',
})
export class InboundReceiptConfirmComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
