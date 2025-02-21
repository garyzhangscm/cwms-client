import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';


import { PrintingService } from '../../common/services/printing.service';
import { ReportHistory } from '../../report/models/report-history';
import { LocalStorageService } from '../../util/services/LocalStorageService';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CycleCountRequest } from '../models/cycle-count-request';
import { CycleCountRequestType } from '../models/cycle-count-request-type.enum';
import { CycleCountResult } from '../models/cycle-count-result';


@Injectable({
  providedIn: 'root',
})
export class CycleCountRequestService {
  private COUNT_REQUEST_PER_PAGE = 15;
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private printingService: PrintingService,
    private warehouseService: WarehouseService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

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
      const data = this.localStorageService.getItem(`inventory.cycle-count-request.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-request/batch/${this.warehouseService.getCurrentWarehouse().id}/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`inventory.cycle-count-request.${batchId}`, res)));
  }
  getOpenCycleCountRequestDetails(batchId: string, refresh: boolean = false): Observable<CycleCountRequest[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(`inventory.cycle-count-request.${batchId}.open`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-request/batch/${this.warehouseService.getCurrentWarehouse().id}/${batchId}/open`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`inventory.cycle-count-request.${batchId}.open`, res)));
  }
  getCancelledCycleCountRequestDetails(batchId: string, refresh: boolean = false): Observable<CycleCountRequest[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(`inventory.cycle-count-request.${batchId}.cancelled`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-request/batch/${this.warehouseService.getCurrentWarehouse().id}/${batchId}/cancelled`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`inventory.cycle-count-request.${batchId}.cancelled`, res)));
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


  printCycleCountSheet(batchId: string, cycleCountRequestIds: number[], locale?: string): Observable<ReportHistory> {


    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    let url = `inventory/cycle-count-request/${this.warehouseService.getCurrentWarehouse().id}/${batchId}/cycle-count-sheet?`
    url = `${url}locale=${locale}`;
    if (cycleCountRequestIds.length > 0) {

      url = `${url}&cycle_count_request_ids=${cycleCountRequestIds.join(',')}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }
}
