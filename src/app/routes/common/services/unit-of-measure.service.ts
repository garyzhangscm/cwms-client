import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { UnitOfMeasure } from '../models/unit-of-measure';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UnitOfMeasureService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}

  loadUnitOfMeasures(refresh: boolean = false): Observable<UnitOfMeasure[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('common.unit-of-measure');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get('common/unit-of-measures')
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.unit-of-measure', res)));
  }
  getUnitOfMeasure(unitOfMeasureId: number): Observable<UnitOfMeasure> {
    const data = this.gzLocalStorageService.getItem('common.unit-of-measure.' + unitOfMeasureId);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get('common/unit-of-measure/' + unitOfMeasureId)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.unit-of-measure.' + unitOfMeasureId, res)));
  }

  addUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    return this.http.post('common/unit-of-measure', unitOfMeasure).pipe(map(res => res.data));
  }

  changeUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    const url = 'common/unit-of-measure/' + unitOfMeasure.id;
    return this.http.put(url, unitOfMeasure).pipe(map(res => res.data));
  }

  removeUnitOfMeasure(unitOfMeasure: UnitOfMeasure): Observable<UnitOfMeasure> {
    const url = 'common/unit-of-measure/' + unitOfMeasure.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeUnitOfMeasures(unitOfMeasures: UnitOfMeasure[]): Observable<UnitOfMeasure[]> {
    const unitOfMeasureIds: number[] = [];
    unitOfMeasures.forEach(unitOfMeasure => {
      unitOfMeasureIds.push(unitOfMeasure.id);
    });
    const params = {
      unit_of_measure_ids: unitOfMeasureIds.join(','),
    };
    return this.http.delete('common/unit-of-measure', params).pipe(map(res => res.data));
  }
}
