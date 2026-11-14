import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ReasonCode } from '../models/reason-code';
import { ReasonCodeType } from '../models/reason-code-type.enum';

@Injectable({
  providedIn: 'root',
})
export class ReasonCodeService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,
  ) {}

  loadReasonCodeByType(type: ReasonCodeType, refresh: boolean = false): Observable<ReasonCode[]> {
    console.log(`${'load reason code by type: ' + 'common/reason-code/'}${  ReasonCodeType[type]}`);
    // if we can find the value in local storage, we get it from there.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(`common.reason-code.${  ReasonCodeType[type]}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(
        `common/reason-codes?type=${ReasonCodeType[type]}&warehouseId=${
          this.warehouseService.getCurrentWarehouse().id
        }`,
      )
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`common.reason-code.${  ReasonCodeType[type]}`, res)));
  }

  loadReasonCode(refresh: boolean = false): Observable<ReasonCode[]> {
    // if we can find the value in local storage, we get it from there.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem('common.reason-code');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`common/reason-codes?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem('common.reason-code', res)));
  }

  
  addReasonCode(reasonCode: ReasonCode): Observable<ReasonCode> {
    return this.http.post(
      `common/reason-codes?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, reasonCode).pipe(map(res => res.data));
  }
 

  removeReasonCode(reasonCodeId: number): Observable<String> {
    return this.http.delete(`common/reason-codes/${reasonCodeId}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`).pipe(map(res => res.data));
  }

}
