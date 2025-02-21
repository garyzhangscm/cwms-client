import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AuditCountResult } from '../models/audit-count-result';

@Injectable({
  providedIn: 'root',
})
export class AuditCountResultService {
  constructor(private http: _HttpClient, 
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,) {}

  getAuditCountResultDetails(batchId: string, refresh: boolean = false): Observable<AuditCountResult[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(`inventory.audit-count-result.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/audit-count-result/${this.warehouseService.getCurrentWarehouse().id}/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`inventory.audit-count-result.${batchId}`, res)));
  }

  getEmptyAuditCountResultDetails(batchId: string, locationId: number): Observable<AuditCountResult[]> {
    return this.http
      .get(`inventory/audit-count-result/${batchId}/${locationId}/inventories`)
      .pipe(map(res => res.data));
  }

  saveAuditCountResultDetails(
    batchId: string,
    locationId: number,
    auditCountResults: AuditCountResult[],
  ): Observable<AuditCountResult[]> {
    return this.http
      .post(`inventory/audit-count-result/${batchId}/${locationId}/confirm`, auditCountResults)
      .pipe(map(res => res.data));
  }
}
