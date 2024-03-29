import { Inject, Injectable } from '@angular/core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { PrintingService } from '../../common/services/printing.service';
import { ReportHistory } from '../../report/models/report-history';
import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AuditCountRequest } from '../models/audit-count-request';
import { Inventory } from '../models/inventory';

@Injectable({
  providedIn: 'root',
})
export class AuditCountRequestService {
  private COUNT_REQUEST_PER_PAGE = 30;
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageService,
    private printingService: PrintingService,
    private warehouseService: WarehouseService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  getAuditCountRequestDetails(batchId: string, refresh: boolean = false): Observable<AuditCountRequest[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem(`inventory.audit-count-request.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/audit-count-request/batch/${this.warehouseService.getCurrentWarehouse().id}/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`inventory.audit-count-request.${batchId}`, res)));
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
