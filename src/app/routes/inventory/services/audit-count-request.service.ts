import { Injectable } from '@angular/core';
import { AuditCountRequest } from '../models/audit-count-request';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../models/inventory';

@Injectable({
  providedIn: 'root',
})
export class AuditCountRequestService {
  private COUNT_REQUEST_PER_PAGE = 10;
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageServiceService,
    private printingService: PrintingService,
  ) {}

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
      .get(`inventory/audit-count-request/${batchId}`)
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

  printAuditCountRequestReport(batchId: string, auditCountRequests: AuditCountRequest[]) {
    const reportName = `audit count request report`;
    this.printingService.print(
      reportName,
      this.generateAuditCountRequestReport(reportName, batchId, auditCountRequests),
    );
  }
  generateAuditCountRequestReport(
    reportName: string,
    batchId: string,
    auditCountRequests: AuditCountRequest[],
  ): string[] {
    const pages: string[] = [];

    const pageLines: string[] = [];

    auditCountRequests.forEach((auditCountRequest, index) => {
      if (index % this.COUNT_REQUEST_PER_PAGE === 0) {
        // Add a page header
        pageLines.push(`<h1>${reportName}</h1>
                        <h2>${batchId}</h2>
                       <table> 
                         <tr>
                           <th>location</th>
                           <th>item</th>
                           <th>item description</th>
                           <th>quantity</th>
                           <th>cycle count quantity</th>
                           <th>audit count quantity</th>
                          </tr>`);
      }

      pageLines.push(`
                      <tr>
                        <td>${auditCountRequest.location.name}</td>
                        <td>${auditCountRequest.item.name}</td>
                        <td>${auditCountRequest.item.description}</td>
                        <td>${auditCountRequest.cycleCountResult.quantity}</td>
                        <td>${auditCountRequest.cycleCountResult.countQuantity}</td>
                        <td>_____________________</td>
                      </tr>`);

      if ((index + 1) % this.COUNT_REQUEST_PER_PAGE === 0) {
        // start a new page
        pageLines.push(`</table>`);
        pages.push(pageLines.join(''));
        pageLines.length = 0;
      }
    });

    return pages;
  }
}
