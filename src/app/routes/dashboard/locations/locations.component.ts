import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { LocationService } from '../../warehouse-layout/services/location.service';

@Component({
  selector: 'app-dashboard-locations',
  templateUrl: './locations.component.html',
})
export class DashboardLocationsComponent implements OnInit {
  locationData: any[];

  constructor(private http: _HttpClient, private locationService: LocationService) {}

  ngOnInit() {
    this.locationData = [
      {
        x: 'EACH_PICK_1',
        y: 300,
      },
      {
        x: 'EACH_PICK_2',
        y: 300,
      },
      {
        x: 'CASE_PICK_1',
        y: 100,
      },
      {
        x: 'PALLET_PICK_1',
        y: 100,
      },
      {
        x: 'RECEIVE_DOCK',
        y: 20,
      },
      {
        x: 'RECEIVE_STAGE',
        y: 50,
      },
      {
        x: 'SHIP_DOCK',
        y: 20,
      },
      {
        x: 'SHIP_STAGE',
        y: 50,
      },
    ];
  }
}
