import { Injectable } from '@angular/core';
import { AuditCountResult } from '../models/audit-count-result';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuditCountResultService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}

  getAuditCountResultDetails(batchId: string, refresh: boolean = false): Observable<AuditCountResult[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem(`inventory.audit-count-result.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/audit-count-result/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`inventory.audit-count-result.${batchId}`, res)));
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
