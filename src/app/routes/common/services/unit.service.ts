import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Unit } from '../models/unit';
import { UnitType } from '../models/unit-type';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageService, 
    private warehouseService: WarehouseService
  ) {}

  loadUnits(refresh: boolean = false): Observable<Unit[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('common.unit');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`common/units?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.unit', res)));
  }
  
  
}
