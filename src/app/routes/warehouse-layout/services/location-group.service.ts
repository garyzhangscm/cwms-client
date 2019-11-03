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

  getLocationGroups(locationGroupTypes: string[]): Observable<LocationGroup[]> {
    if (locationGroupTypes != null) {
      const params = {
        location_group_types: locationGroupTypes.join(','),
      };
      return this.http.get('layout/locationgroups', params).pipe(map(res => res.data));
    } else {
      return this.http.get('layout/locationgroups').pipe(map(res => res.data));
    }
  }

  addLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    return this.http.post('layout/locationgroups').pipe(map(res => res.data));
  }

  changeLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    return this.http.put('layout/locationgroups').pipe(map(res => res.data));
  }

  deleteLocationGroup(locationGroup: LocationGroup): Observable<LocationGroup> {
    return this.http.delete('layout/locationgroups').pipe(map(res => res.data));
  }
}
