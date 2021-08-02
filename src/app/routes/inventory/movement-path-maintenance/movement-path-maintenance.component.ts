import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-movement-path-maintenance',
  templateUrl: './movement-path-maintenance.component.html',
})
export class InventoryMovementPathMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
