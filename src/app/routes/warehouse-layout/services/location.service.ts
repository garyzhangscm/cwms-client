import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseLocation } from '../models/warehouse-location';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getLocations(locationGroupTypes?: string, locationGroups?: string, name?: string): Observable<WarehouseLocation[]> {
    let url = `layout/locations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (locationGroupTypes) {
      url = `${url}&locationGroupTypeIds=${locationGroupTypes}`;
    }
    if (locationGroups) {
      url = `${url}&locationGroupIds=${locationGroups}`;
    }
    if (name) {
      url = `${url}&name=${name}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getLocation(id: number): Observable<WarehouseLocation> {
    return this.http.get('layout/locations/' + id).pipe(map(res => res.data));
  }

  addLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    return this.http.post('layout/locations', location).pipe(map(res => res.data));
  }

  changeLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    const url = 'layout/locations/' + location.id;
    return this.http.post(url, location).pipe(map(res => res.data));
  }

  removeLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    const url = 'layout/locations/' + location.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeLocations(locations: WarehouseLocation[]): Observable<WarehouseLocation[]> {
    const locationIds: number[] = [];
    locations.forEach(location => {
      locationIds.push(location.id);
    });
    const params = {
      locationIds: locationIds.join(','),
    };
    return this.http
      .delete(`layout/locations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, params)
      .pipe(map(res => res.data));
  }
}
