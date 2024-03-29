
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { LocationStatus } from '../models/location-status.enum';
import { WarehouseLocation } from '../models/warehouse-location';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private utilService: UtilService) {}

  getLocations(locationGroupTypes?: string, locationGroupIds?: string, name?: string, emptyReservedCodeOnly?: boolean, 
    locationStatus?: LocationStatus): Observable<WarehouseLocation[]> {
     

    const url = `layout/locations`;
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
     
    if (locationGroupTypes) {
      params = params.append('locationGroupTypeIds', locationGroupTypes);  
    }
    if (locationGroupIds) {
      params = params.append('locationGroupIds', locationGroupIds);  
    }
    if (name) {
      params = params.append('name', this.utilService.encodeValue(name));  
    }
    if (emptyReservedCodeOnly !== undefined) {
      params = params.append('emptyReservedCodeOnly', emptyReservedCodeOnly);  
    }
    if (locationStatus) {
      params = params.append('locationStatus', this.utilService.encodeValue(locationStatus));  
    }
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getLocation(id: number): Observable<WarehouseLocation> {
    return this.http.get(`layout/locations/${  id}`).pipe(map(res => res.data));
  }

  addLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    return this.http.post(`layout/locations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, location).pipe(map(res => res.data));
  }

  changeLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    const url = `layout/locations/${  location.id}`;
    return this.http.post(url, location).pipe(map(res => res.data));
  }

  removeLocation(location: WarehouseLocation): Observable<WarehouseLocation> {
    const url = `layout/locations/${  location.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeLocations(locations: WarehouseLocation[]): Observable<WarehouseLocation[]> {
    const locationIds: number[] = [];
    locations.forEach(location => {
      locationIds.push(location.id!);
    });
    const params = {
      locationIds: locationIds.join(','),
    };
    return this.http
      .delete(`layout/locations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, params)
      .pipe(map(res => res.data));
  }
}
