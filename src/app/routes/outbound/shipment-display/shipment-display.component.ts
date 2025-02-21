import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-outbound-shipment-display',
    templateUrl: './shipment-display.component.html',
    standalone: false
})
export class OutboundShipmentDisplayComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
