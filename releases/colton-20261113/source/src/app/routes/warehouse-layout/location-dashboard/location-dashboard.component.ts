import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { LocationGroupService } from '../services/location-group.service';

@Component({
    selector: 'app-warehouse-layout-location-dashboard',
    templateUrl: './location-dashboard.component.html',
    standalone: false
})
export class WarehouseLayoutLocationDashboardComponent implements OnInit {

  locationUtilizationData : any[] = [];
  locationUtilizationLayout: any = {};

  isSpinning = false;
  hasLoaded = false;
  loadError: 'access' | 'failed' | null = null;

  constructor(private http: _HttpClient, private locationGroupService: LocationGroupService) { }

  ngOnInit(): void {
    this.loadUtilization();
  }

  loadUtilization(): void {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.hasLoaded = false;
    this.loadError = null;
    this.locationUtilizationData = [];
    this.locationGroupService.getStorageLocationGroupUtilization().subscribe({
      next: (locationGroupUtil) => {
        if (locationGroupUtil == null || locationGroupUtil.length == 0) {
          this.locationUtilizationData = [];
        }
        else {

          var locationGroupNames : string[] = [];
          var emptyLocations : number[] = [];
          var partialLocations : number[]  = [];
          var fullLocations : number[]  = [];
          locationGroupUtil.forEach(
            locationUtil => {
              locationGroupNames = [...locationGroupNames, locationUtil.locationGroupName];
              emptyLocations = [...emptyLocations, locationUtil.emptyLocation];
              partialLocations = [...partialLocations, locationUtil.partialLocation];
              fullLocations = [...fullLocations, locationUtil.fullLocation];
            }
          )
          this.locationUtilizationData = [
            {
              x: locationGroupNames,
              y: emptyLocations,
              name: 'Empty Locations',
              type: 'bar'
            }
            , 
            {
              x: locationGroupNames,
              y: partialLocations,
              name: 'Partial Locations',
              type: 'bar'
            }
            , 
            {
              x: locationGroupNames,
              y: fullLocations,
              name: 'Full Locations',
              type: 'bar'
            }  
          ];
          this.locationUtilizationLayout = {barmode: 'stack'};
        }

        this.hasLoaded = true;
        this.isSpinning = false;
      }, 
      error: (error) => {
        this.loadError = error.status === 401 || error.status === 403 ? 'access' : 'failed';
        this.isSpinning = false;
      }
    })
    

   }

}
