import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-inventory-location-utilization-snapshot',
  templateUrl: './location-utilization-snapshot.component.html',
})
export class InventoryLocationUtilizationSnapshotComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
