import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { LocationGroupType } from '../models/location-group-type';

@Injectable({
  providedIn: 'root',
})
export class LocationGroupTypeService {
  constructor(private http: _HttpClient, 
    private localStorageService: LocalStorageService) {}

  loadLocationGroupTypes(shippingStage?: boolean): Observable<LocationGroupType[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server 
    let url = 'layout/locationgrouptypes';
    if (shippingStage != undefined) {
      url = `${url}?shippingStage=${shippingStage}`
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  getLocationGroupType(locationGroupTypeId: number): Observable<LocationGroupType> {
    const data = this.localStorageService.getItem(`warehouse-layout.location-group-type.${  locationGroupTypeId}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`layout/locationgrouptypes/${  locationGroupTypeId}`)
      .pipe(map(res => res.data))
      .pipe(
        tap(res =>
          this.localStorageService.setItem(`warehouse-layout.location-group-type.${  locationGroupTypeId}`, res),
        ),
      );
  }
}
