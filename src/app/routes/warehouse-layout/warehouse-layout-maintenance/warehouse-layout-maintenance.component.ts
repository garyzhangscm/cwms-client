import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-warehouse-layout-warehouse-layout-maintenance',
    templateUrl: './warehouse-layout-maintenance.component.html',
    standalone: false
})
export class WarehouseLayoutWarehouseLayoutMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
