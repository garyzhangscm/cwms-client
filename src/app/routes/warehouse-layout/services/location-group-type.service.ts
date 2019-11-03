import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { LocationGroupType } from '../models/location-group-type';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocationGroupTypeService {
  constructor(private http: _HttpClient) {}

  loadLocationGroupType(): Observable<LocationGroupType[]> {
    return this.http.get('layout/locationgrouptypes').pipe(map(res => res.data));
  }
}
