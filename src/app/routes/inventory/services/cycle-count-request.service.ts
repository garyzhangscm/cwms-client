import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Observable, of } from 'rxjs';
import { CycleCountRequest } from '../models/cycle-count-request';
import { map, tap } from 'rxjs/operators';
import { InventoryService } from './inventory.service';
import { PrintingService } from '../../common/services/printing.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Inventory } from '../models/inventory';
import { CycleCountResult } from '../models/cycle-count-result';
import { CycleCountRequestType } from '../models/cycle-count-request-type.enum';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class CycleCountRequestService {
  private COUNT_REQUEST_PER_PAGE = 30;
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageServiceService,
    private printingService: PrintingService,
    private warehouseService: WarehouseService,
  ) {}

  generateCycleCountRequests(
    batchId: string,
    cycleCountRequestType: CycleCountRequestType,
    beginValue: string,
    endValue: string,
    includeEmptyLocation: boolean,
  ): Observable<CycleCountRequest[]> {
    if (includeEmptyLocation == null) {
      includeEmptyLocation = false;
    }
    const params = {
      batchId,
      cycleCountRequestType,
      beginValue,
      endValue,
      includeEmptyLocation,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
    };

    return this.http.post(`inventory/cycle-count-requests`, null, params).pipe(map(res => res.data));
  }
  getCycleCountRequestDetails(batchId: string, refresh: boolean = false): Observable<CycleCountRequest[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem(`inventory.cycle-count-request.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-request/batch/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`inventory.cycle-count-request.${batchId}`, res)));
  }
  getOpenCycleCountRequestDetails(batchId: string, refresh: boolean = false): Observable<CycleCountRequest[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem(`inventory.cycle-count-request.${batchId}.open`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-request/batch/${batchId}/open`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`inventory.cycle-count-request.${batchId}.open`, res)));
  }
  getCancelledCycleCountRequestDetails(batchId: string, refresh: boolean = false): Observable<CycleCountRequest[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem(`inventory.cycle-count-request.${batchId}.cancelled`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-request/batch/${batchId}/cancelled`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`inventory.cycle-count-request.${batchId}.cancelled`, res)));
  }

  confirmCycleCountRequests(cycleCountRequests: CycleCountRequest[]): Observable<CycleCountResult[]> {
    if (cycleCountRequests.length === 0) {
      return of([]);
    }
    const cycleCountRequestIds: number[] = [];
    cycleCountRequests.forEach(cycleCountRequest => {
      cycleCountRequestIds.push(cycleCountRequest.id);
    });
    const params = {
      cycleCountRequestIds: cycleCountRequestIds.join(','),
    };
    return this.http.post('inventory/cycle-count-request/confirm', null, params).pipe(map(res => res.data));
  }

  saveCycleCountResults(
    cycleCountRequest: CycleCountRequest,
    cycleCountResults: CycleCountResult[],
  ): Observable<CycleCountResult[]> {
    return this.http
      .post(`inventory/cycle-count-request/${cycleCountRequest.id}/confirm`, cycleCountResults)
      .pipe(map(res => res.data));
  }

  cancelCycleCountRequests(cycleCountRequests: CycleCountRequest[]): Observable<CycleCountRequest[]> {
    const cycleCountRequestIds: number[] = [];
    cycleCountRequests.forEach(cycleCountRequest => {
      cycleCountRequestIds.push(cycleCountRequest.id);
    });
    const params = {
      cycleCountRequestIds: cycleCountRequestIds.join(','),
    };
    return this.http.post('inventory/cycle-count-request/cancel', null, params).pipe(map(res => res.data));
  }

  reopenCancelledCycleCountRequests(cycleCountRequests: CycleCountRequest[]): Observable<CycleCountRequest[]> {
    const cycleCountRequestIds: number[] = [];
    cycleCountRequests.forEach(cycleCountRequest => {
      cycleCountRequestIds.push(cycleCountRequest.id);
    });
    const params = {
      cycleCountRequestIds: cycleCountRequestIds.join(','),
    };
    return this.http.post('inventory/cycle-count-request/reopen', null, params).pipe(map(res => res.data));
  }

  printCycleCountRequestReport(batchId: string, cycleCountRequests: CycleCountRequest[]) {
    const reportName = `cycle count request report`;
    this.getInventorySummariesForCounts(cycleCountRequests).subscribe(cycleCountResults => {
      this.printingService.print(
        reportName,
        this.generateCycleCountRequestReport(reportName, batchId, cycleCountResults),
      );
    });
  }
  generateCycleCountRequestReport(
    reportName: string,
    batchId: string,
    cycleCountResults: CycleCountResult[],
  ): string[] {
    const pages: string[] = [];

    const pageLines: string[] = [];

    cycleCountResults.forEach((cycleCountResult, index) => {
      if (index % this.COUNT_REQUEST_PER_PAGE === 0) {
        // Add a page header
        pageLines.push(`<h1>${reportName}</h1>
                        <h2>${batchId}</h2>
                       <table> 
                         <tr>
                           <th>location</th>
                           <th>item</th>
                           <th>quantity</th>
                           <th>verify quantity</th>
                          </tr>`);
      }

      pageLines.push(`
                      <tr>
                        <td>${cycleCountResult.location.name}</td>
                        <td>${cycleCountResult.item ? cycleCountResult.item.name : '_______________'}</td>
                        <td>${cycleCountResult.quantity}</td>
                        <td>_____________________</td>
                      </tr>`);

      if ((index + 1) % this.COUNT_REQUEST_PER_PAGE === 0) {
        // start a new page
        pageLines.push(`</table>`);
        pages.push(pageLines.join(''));
        pageLines.length = 0;
      }
    });
    // When cycleCountResults.length % this.COUNT_REQUEST_PER_PAGE !== 0
    // It means we haven't setup the last page correctly yet. Let's
    // add the page end and add the last page to the page list
    if (cycleCountResults.length % this.COUNT_REQUEST_PER_PAGE !== 0) {
      pageLines.push(`</table>`);
      pages.push(pageLines.join(''));
      pageLines.length = 0;
    }

    return pages;
  }

  getInventorySummariesForCount(cycleCountRequest: CycleCountRequest): Observable<CycleCountResult[]> {
    const url = `inventory/cycle-count-request/${cycleCountRequest.id}/inventory-summary`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  getInventorySummariesForCounts(cycleCountRequests: CycleCountRequest[]): Observable<CycleCountResult[]> {
    const cycleCountRequestIds: number[] = [];
    cycleCountRequests.forEach(cycleCountRequest => {
      cycleCountRequestIds.push(cycleCountRequest.id);
    });

    const url = `inventory/cycle-count-request/inventory-summary?cycle_count_request_ids=${cycleCountRequestIds.join(
      ',',
    )}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
}
