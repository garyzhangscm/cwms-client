import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseLocation } from '../models/warehouse-location';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: _HttpClient) {}

  getLocations(locationGroupTypes: string[], locationGroups: string[]): Observable<WarehouseLocation[]> {
    const params = {
      location_group_types: '',
      location_groups: '',
    };
    if (locationGroupTypes != null) {
      params.location_group_types = locationGroupTypes.join(',');
    }
    if (locationGroups != null) {
      params.location_groups = locationGroups.join(',');
    }
    return this.http.get('layout/locations', params).pipe(map(res => res.data));
  }

  getLocation(id: number): Observable<WarehouseLocation> {
    return this.http.get('layout/location/' + id).pipe(map(res => res.data));
  }

  addLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    return this.http.post('layout/locations', location).pipe(map(res => res.data));
  }

  changeLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    const url = 'layout/location/' + location.id;
    return this.http.put(url, location).pipe(map(res => res.data));
  }

  removeLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    const url = 'layout/location/' + location.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeLocations(locations: WarehouseLocation[]): Observable<WarehouseLocation[]> {
    const locationIds: number[] = [];
    locations.forEach(location => {
      locationIds.push(location.id);
    });
    const params = {
      location_ids: locationIds.join(','),
    };
    return this.http.delete('layout/location', params).pipe(map(res => res.data));
  }
}
