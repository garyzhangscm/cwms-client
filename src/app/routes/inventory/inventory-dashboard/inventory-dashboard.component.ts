import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
})
export class InventoryInventoryDashboardComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
