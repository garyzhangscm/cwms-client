import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-inventory-inventory-adjustment-threshold-confirm',
    templateUrl: './inventory-adjustment-threshold-confirm.component.html',
    standalone: false
})
export class InventoryInventoryAdjustmentThresholdConfirmComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
