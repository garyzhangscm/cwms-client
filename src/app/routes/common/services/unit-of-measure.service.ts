import { HttpParams } from '@angular/common/http';
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

  readonly isolatedTest = (globalThis as any).__MES_PUBLIC_CONFIG__?.masterDataTest === true;
  private get endpoint(): string { return this.isolatedTest ? 'master-data-test/units' : 'common/unit-of-measures'; }
  private get cacheKey(): string {
    return `${this.isolatedTest ? 'test.' : ''}common.unit-of-measure.${this.companyService.getCurrentCompany()!.id}.${this.warehouseService.getCurrentWarehouse().id}`;
  }
  private clearUnitCache(id?: number): void {
    this.localStorageService.removeItem(this.cacheKey);
    if (id != null) this.localStorageService.removeItem(`${this.cacheKey}.${id}`);
  }

  loadUnitOfMeasures(refresh: boolean = true): Observable<UnitOfMeasure[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(this.cacheKey);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`${this.endpoint}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(this.cacheKey, res)));
  }
  getUnitOfMeasure(unitOfMeasureId: number): Observable<UnitOfMeasure> {
    const data = this.localStorageService.getItem(`${this.cacheKey}.${unitOfMeasureId}`);
    if (data !== null) {
      return of(data);
    }

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    
    return this.http
      .get(`${this.endpoint}/${unitOfMeasureId}`, params)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`${this.cacheKey}.${unitOfMeasureId}`, res)));
  }

  saveUnitLevels(updates: { id: number; level: UnitOfMeasure['level']; _testRevision?: number }[]): Observable<UnitOfMeasure[]> {
    const scope = this.isolatedTest ? '' : `?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.put(`${this.endpoint}/levels${scope}`, { updates }).pipe(
      map(res => res.data), tap(() => { for (const update of updates) this.clearUnitCache(update.id); })
    );
  }

  addUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    return this.http.post(this.endpoint, unitOfMeasure).pipe(map(res => res.data), tap(() => this.clearUnitCache()));
  }

  changeUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    const url = `${this.endpoint}/${unitOfMeasure.id}`;
    return this.http.put(url, unitOfMeasure).pipe(map(res => res.data), tap(() => this.clearUnitCache(unitOfMeasure.id)));
  }

  removeUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    const url = `${this.endpoint}/${unitOfMeasure.id}`;
    return this.http.delete(url).pipe(map(res => res.data), tap(() => this.clearUnitCache(unitOfMeasure.id)));
  }

  removeUnitOfMeasures(unitOfMeasures: UnitOfMeasure[]): Observable<UnitOfMeasure[]> {
    const unitOfMeasureIds: number[] = [];
    unitOfMeasures.forEach(unitOfMeasure => {
      unitOfMeasureIds.push(unitOfMeasure.id!);
    });
    const params = {
      unitOfMeasureIds: unitOfMeasureIds.join(','),
    };
    return this.http.delete(this.endpoint, params).pipe(map(res => res.data), tap(() => this.clearUnitCache()));
  }
}
