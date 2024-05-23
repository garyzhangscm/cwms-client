import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-warehouse-layout-pick-zone',
  templateUrl: './pick-zone.component.html',
})
export class WarehouseLayoutPickZoneComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
