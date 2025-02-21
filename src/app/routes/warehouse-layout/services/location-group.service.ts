import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LocationGroup } from '../models/location-group';
import { StorageLocationGroupUtilization } from '../models/storage-location-group-utilization';
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

  getLocationGroup(id: number): Observable<LocationGroup> {
    return this.http.get(`layout/locationgroups/${id}`).pipe(map(res => res.data));
  }
  getLocationGroups(locationGroupTypes: number[], locationGroups: number[]): Observable<LocationGroup[]> {
    let url = `layout/locationgroups?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (locationGroupTypes != null && locationGroupTypes.length > 0) {
      url = `${url}&locationGroupTypes=${locationGroupTypes.join(',')}`;
    }
    if (locationGroups != null && locationGroups.length > 0) {
      url = `${url}&locationGroups=${locationGroups.join(',')}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  addLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    if (!locationGroup.warehouse) {
      console.log(`warehouse is not setup yet`);
      locationGroup.warehouse = this.warehouseService.getCurrentWarehouse();
    }
    return this.http.post('layout/locationgroups', locationGroup).pipe(map(res => res.data));
  }

  changeLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    const url = `layout/locationgroups/${  locationGroup.id}`;
    return this.http.put(url, locationGroup).pipe(map(res => res.data));
  }

  removeLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    const url = `layout/locationgroups/${  locationGroup.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeLocationGroupById(locationGroupId: number): Observable<LocationGroup> {
    const url = `layout/locationgroups/${locationGroupId}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeLocationGroups(locationgroups: LocationGroup[]): Observable<LocationGroup[]> {
    const locationGroupIds: number[] = [];
    locationgroups.forEach(locationGroup => {
      locationGroupIds.push(locationGroup.id!);
    });
    const params = {
      locationGroupIds: locationGroupIds.join(','),
    };
    return this.http.delete('layout/locationgroups', params).pipe(map(res => res.data));
  }
  getQCLocationGroups(): Observable<LocationGroup[]> {
    let url = `layout/locationgroups/qc?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    return this.http.get(url).pipe(map(res => res.data));
  }
  
  getStorageLocationGroupUtilization(): Observable<StorageLocationGroupUtilization[]> {
    let url = `layout/locationgroups/utilization/storage?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    return this.http.get(url).pipe(map(res => res.data));
  }
}
