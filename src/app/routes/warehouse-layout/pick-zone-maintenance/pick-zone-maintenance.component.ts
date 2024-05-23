import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-warehouse-layout-pick-zone-maintenance',
  templateUrl: './pick-zone-maintenance.component.html',
})
export class WarehouseLayoutPickZoneMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
