import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-warehouse-layout-location-dashboard',
  templateUrl: './location-dashboard.component.html',
})
export class WarehouseLayoutLocationDashboardComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
