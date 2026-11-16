import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';

export type ProductionEntry = 'dashboard' | 'confirmation';

export interface PendingProductionSubmission {
  key: string;
  request: WorkOrderProduceTransaction;
}

@Injectable({
  providedIn: 'root',
})
export class WorkOrderProduceTransactionService {
  constructor(private http: _HttpClient,
    private dateTimeService: DateTimeService, private warehouseService: WarehouseService) {}

  private pendingKey(entry: ProductionEntry): string {
    return `mes-production-submission-v1:${this.warehouseService.getCurrentWarehouse().id}:${entry}`;
  }

  pendingSubmission(entry: ProductionEntry): PendingProductionSubmission | undefined {
    const stored = sessionStorage.getItem(this.pendingKey(entry));
    return stored ? JSON.parse(stored) as PendingProductionSubmission : undefined;
  }

  beginSubmission(entry: ProductionEntry, request: WorkOrderProduceTransaction): PendingProductionSubmission {
    if (this.pendingSubmission(entry)) {
      throw new Error('An earlier production submission needs confirmation.');
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    const key = [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-');
    const saved = JSON.stringify({ key, request });
    sessionStorage.setItem(this.pendingKey(entry), saved);
    return JSON.parse(saved) as PendingProductionSubmission;
  }

  saveWorkOrderProduceTransaction(
    entry: ProductionEntry, submission: PendingProductionSubmission,
  ): Observable<WorkOrderProduceTransaction> {
    const storageKey = this.pendingKey(entry);
    const clearSubmission = (): void => {
      if (JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')?.key === submission.key) {
        sessionStorage.removeItem(storageKey);
      }
    };
    return this.http.post('workorder/work-order-produce-transactions', submission.request, undefined, {
      headers: new HttpHeaders().set('Idempotency-Key', submission.key),
    }).pipe(
      map(res => {
        const transaction = res.data as WorkOrderProduceTransaction | undefined;
        if (!transaction?.id) {
          throw new Error('The production transaction could not be confirmed.');
        }
        return transaction;
      }),
      tap(clearSubmission),
      catchError(error => {
        // The work order service uses these codes for a rejected, rolled-back submission.
        if (error?.status === 400 || error?.status === 55001 || error?.status === 55003) {
          clearSubmission();
        }
        return throwError(() => error);
      }),
    );
  }

  getWorkOrderProduceTransaction(workOrderNumber?: string, productionLineId?: number,  
    startTime?: Date, endTime?:Date, date?: Date): Observable<WorkOrderProduceTransaction[]> {
    
    let url = `workorder/work-order-produce-transactions?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (workOrderNumber) {
      url = `${url}&workOrderNumber=${workOrderNumber}`;
    }
    if (productionLineId) {
      url = `${url}&productionLineId=${productionLineId}`;
    }
    if (startTime) {
      url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
    }
    if (date) {
      url = `${url}&date=${this.dateTimeService.getISODateString(date)}`;
    }
    
    return this.http.get(url).pipe(map(res => res.data));
  }
}
