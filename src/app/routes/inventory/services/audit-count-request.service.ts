import { Injectable } from '@angular/core';
import { I18NService } from '@core/i18n/i18n.service';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PrintingService } from '../../common/services/printing.service';
import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';
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
    private i18n: I18NService,
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
      .get(`inventory/audit-count-request/batch/${batchId}`)
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

    console.log(`get : ${auditCountRequests.length} of audit count request`);
    auditCountRequests.forEach((auditCountRequest, index) => {
      if (index % this.COUNT_REQUEST_PER_PAGE === 0) {
        
        console.log(`audit count reuqest: add table header`);
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
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>_____________________</td>
                      </tr>`);

      if ((index + 1) % this.COUNT_REQUEST_PER_PAGE === 0) {
        // start a new page
        pageLines.push(`</table>`);
        pages.push(pageLines.join(''));
        pageLines.length = 0;
      }
    });

    // When auditCountRequests.length % this.COUNT_REQUEST_PER_PAGE !== 0
    // It means we haven't setup the last page correctly yet. Let's
    // add the page end and add the last page to the page list
    if (auditCountRequests.length % this.COUNT_REQUEST_PER_PAGE !== 0) {
      pageLines.push(`</table>`); 
      if (this.COUNT_REQUEST_PER_PAGE - 
        (auditCountRequests.length % this.COUNT_REQUEST_PER_PAGE) > 2) {

          // we have enough room to print the summary
          
          pageLines.push(this.generateAuditCountRequestReportFooter(auditCountRequests.length)); 
          pages.push(pageLines.join(''));
          pageLines.length = 0;       
      }
      else {
        // we don't have enough room in current page to print the summary,
        // let's start a new page        
        pages.push(pageLines.join(''));
        pageLines.length = 0;       

        pages.push(this.generateAuditCountRequestReportFooter(auditCountRequests.length));
      }

    }
    else {
      pages.push(this.generateAuditCountRequestReportFooter(auditCountRequests.length));
    }
    console.log(`will print audit count request: ${pages}`);
    return pages;
  }

  
  generateAuditCountRequestReportFooter(totalLocationNumbers: number): string{

    return `
    <h2  style="text-align: left">${this.i18n.fanyi('summary')}</h2>
        <table style="margin-top: 25px"> 
            <tr> 
                <td >${this.i18n.fanyi('count_user')}</td>
                <td >_____________________</td>
                <td >${this.i18n.fanyi('count_date')}</td>
                <td >_____________________</td>                
            </tr> 
            <tr> 
                <td >${this.i18n.fanyi('total_locations')}</td>
                <td >${totalLocationNumbers}</td>
                <td >${this.i18n.fanyi('counted_locations')}</td>
                <td >_____________________</td>           
            </tr> 
            <tr> 
                <td >${this.i18n.fanyi('discrepancy_locations')}</td>
                <td >_____________________</td>
                <td >${this.i18n.fanyi('comment')}</td>
                <td >_____________________</td>
            </tr>
        </table>
    `;
  }
}
