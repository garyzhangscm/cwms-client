import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-inventory-inventory-adjustment-threshold-maintenance',
    templateUrl: './inventory-adjustment-threshold-maintenance.component.html',
    standalone: false
})
export class InventoryInventoryAdjustmentThresholdMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
