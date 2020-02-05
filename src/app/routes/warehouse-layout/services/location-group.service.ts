import { Injectable } from '@angular/core';
import { LocationGroup } from '../models/location-group';
import { Observable } from 'rxjs';
import { _HttpClient } from '@delon/theme';
import { map } from 'rxjs/operators';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class LocationGroupService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  loadLocationGroups(): Observable<LocationGroup[]> {
    const url = `layout/locationgroups?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  getLocationGroups(locationGroupTypes: string[]): Observable<LocationGroup[]> {
    const url = `layout/locationgroups?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (locationGroupTypes != null) {
      const params = {
        location_group_types: locationGroupTypes.join(','),
      };
      return this.http.get(url, params).pipe(map(res => res.data));
    } else {
      return this.loadLocationGroups();
    }
  }

  addLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    return this.http.post('layout/locationgroups', locationGroup).pipe(map(res => res.data));
  }

  changeLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    const url = 'layout/locationgroup/' + locationGroup.id;
    return this.http.put(url, locationGroup).pipe(map(res => res.data));
  }

  removeLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    const url = 'layout/locationgroup/' + locationGroup.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeLocationGroups(locationgroups: LocationGroup[]): Observable<LocationGroup[]> {
    const locationGroupIds: number[] = [];
    locationgroups.forEach(locationGroup => {
      locationGroupIds.push(locationGroup.id);
    });
    const params = {
      location_group_ids: locationGroupIds.join(','),
    };
    return this.http.delete('layout/locationgroup', params).pipe(map(res => res.data));
  }
}
