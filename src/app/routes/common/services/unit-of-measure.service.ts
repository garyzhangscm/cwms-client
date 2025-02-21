import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';


import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { UnitOfMeasure } from '../models/unit-of-measure';

@Injectable({
  providedIn: 'root',
})
export class UnitOfMeasureService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}

  loadUnitOfMeasures(refresh: boolean = true): Observable<UnitOfMeasure[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem('common.unit-of-measure');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`common/unit-of-measures?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem('common.unit-of-measure', res)));
  }
  getUnitOfMeasure(unitOfMeasureId: number): Observable<UnitOfMeasure> {
    const data = this.localStorageService.getItem(`common.unit-of-measure.${  unitOfMeasureId}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`common/unit-of-measures/${  unitOfMeasureId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`common.unit-of-measure.${  unitOfMeasureId}`, res)));
  }

  addUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    return this.http.post('common/unit-of-measures', unitOfMeasure).pipe(map(res => res.data));
  }

  changeUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    const url = `common/unit-of-measures/${  unitOfMeasure.id}`;
    return this.http.put(url, unitOfMeasure).pipe(map(res => res.data));
  }

  removeUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    const url = `common/unit-of-measures/${  unitOfMeasure.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeUnitOfMeasures(unitOfMeasures: UnitOfMeasure[]): Observable<UnitOfMeasure[]> {
    const unitOfMeasureIds: number[] = [];
    unitOfMeasures.forEach(unitOfMeasure => {
      unitOfMeasureIds.push(unitOfMeasure.id!);
    });
    const params = {
      unitOfMeasureIds: unitOfMeasureIds.join(','),
    };
    return this.http.delete('common/unit-of-measures', params).pipe(map(res => res.data));
  }
}
