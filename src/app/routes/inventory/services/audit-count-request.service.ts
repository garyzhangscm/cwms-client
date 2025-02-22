import { inject, Injectable } from '@angular/core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { PrintingService } from '../../common/services/printing.service';
import { ReportHistory } from '../../report/models/report-history';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AuditCountRequest } from '../models/audit-count-request';


@Injectable({
  providedIn: 'root',
})
export class AuditCountRequestService {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private printingService: PrintingService,
    private warehouseService: WarehouseService, 
  ) { }

  getAuditCountRequestDetails(batchId: string, refresh: boolean = false): Observable<AuditCountRequest[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(`inventory.audit-count-request.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/audit-count-request/batch/${this.warehouseService.getCurrentWarehouse().id}/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`inventory.audit-count-request.${batchId}`, res)));
  }

  confirmAuditCountRequests(auditCountRequests: AuditCountRequest[]): Observable<AuditCountRequest[]> {
    const auditCountRequestIds: number[] = [];
    auditCountRequests.forEach(auditCountRequest => {
      auditCountRequestIds.push(auditCountRequest.id);
    });
    const params = {
      audit_count_request_ids: auditCountRequestIds.join(','),
    };
    return this.http.post('inventory/audit-count-request/confirm', params).pipe(map(res => res.data));
  }

  printAuditCountSheet(batchId: string, auditCountRequestIds: number[], locale?: string): Observable<ReportHistory> {


    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    let url = `inventory/audit-count-request/${this.warehouseService.getCurrentWarehouse().id}/${batchId}/audit-count-sheet?`
    url = `${url}&locale=${locale}`;
    if (auditCountRequestIds.length > 0) {

      url = `${url}&audit_count_request_ids=${auditCountRequestIds.join(',')}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }
}
