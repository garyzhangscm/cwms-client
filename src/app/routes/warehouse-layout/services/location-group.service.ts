import { Injectable } from '@angular/core';
import { LocationGroup } from '../models/location-group';
import { Observable } from 'rxjs';
import { _HttpClient } from '@delon/theme';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocationGroupService {
  constructor(private http: _HttpClient) {}

  loadLocationGroups(): Observable<LocationGroup[]> {
    return this.http.get('layout/locationgroups').pipe(map(res => res.data));
  }

  getLocationGroups(locationGroupTypes: string[]): Observable<LocationGroup[]> {
    if (locationGroupTypes != null) {
      const params = {
        location_group_types: locationGroupTypes.join(','),
      };
      return this.http.get('layout/locationgroups', params).pipe(map(res => res.data));
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
