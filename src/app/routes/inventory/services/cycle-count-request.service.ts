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

@Injectable({
  providedIn: 'root',
})
export class CycleCountRequestService {
  private COUNT_REQUEST_PER_PAGE = 1;
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageServiceService,
    private inventoryService: InventoryService,
    private printingService: PrintingService,
  ) {}

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
      .get(`inventory/cycle-count-request/${batchId}`)
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
      .get(`inventory/cycle-count-request/${batchId}/open`)
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
      .get(`inventory/cycle-count-request/${batchId}/cancelled`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`inventory.cycle-count-request.${batchId}.cancelled`, res)));
  }

  confirmCycleCountRequests(cycleCountRequests: CycleCountRequest[]): Observable<CycleCountRequest[]> {
    const cycleCountRequestIds: number[] = [];
    cycleCountRequests.forEach(cycleCountRequest => {
      cycleCountRequestIds.push(cycleCountRequest.id);
    });
    const params = {
      cycle_count_request_ids: cycleCountRequestIds.join(','),
    };
    return this.http.post('inventory/cycle-count-request/confirm', params).pipe(map(res => res.data));
  }

  saveCycleCountResults(
    cycleCountRequest: CycleCountRequest,
    cycleCountResults: { [inventoryId: number]: number },
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
      cycle_count_request_ids: cycleCountRequestIds.join(','),
    };
    return this.http.post('inventory/cycle-count-request/cancel', params).pipe(map(res => res.data));
  }

  reopenCancelledCycleCountRequests(cycleCountRequests: CycleCountRequest[]): Observable<CycleCountRequest[]> {
    const cycleCountRequestIds: number[] = [];
    cycleCountRequests.forEach(cycleCountRequest => {
      cycleCountRequestIds.push(cycleCountRequest.id);
    });
    const params = {
      cycle_count_request_ids: cycleCountRequestIds.join(','),
    };
    return this.http.post('inventory/cycle-count-request/reopen', params).pipe(map(res => res.data));
  }

  printCycleCountRequestReport(batchId: string, cycleCountRequests: CycleCountRequest[]) {
    // Let's get all the inventory in the locations and print the information(item / quantity)
    // on the report
    const locations = new Set<number>();
    const reportName = `cycle count request report`;
    cycleCountRequests.forEach(cycleCountRequest => locations.add(cycleCountRequest.location.id));
    this.inventoryService.getInventoriesByLocationIds(Array.from(locations)).subscribe(inventories => {
      this.printingService.print(reportName, this.generateCycleCountRequestReport(reportName, batchId, inventories));
    });
  }
  generateCycleCountRequestReport(reportName: string, batchId: string, inventories: Inventory[]): string[] {
    const pages: string[] = [];

    const pageLines: string[] = [];

    inventories.forEach((inventory, index) => {
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
                        <td>${inventory.location.name}</td>
                        <td>${inventory.item.name}</td>
                        <td>${inventory.quantity}</td>
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

  getInventoryForCount(cycleCountRequest: CycleCountRequest): Observable<Inventory[]> {
    const url = `inventory/cycle-count-request/${cycleCountRequest.id}/inventories`;
    return this.http.get(url).pipe(map(res => res.data));
  }
}
