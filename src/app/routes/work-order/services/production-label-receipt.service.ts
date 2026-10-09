import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, catchError, exhaustMap, filter, forkJoin, map, of, take, timeout, timer } from 'rxjs';

export interface ProductionLabelJob {
  transactionId: number;
  warehouseId: number;
  workOrderId: number;
  productionLineName?: string;
  labels: { lpn: string; quantity: number }[];
}

@Injectable({ providedIn: 'root' })
export class ProductionLabelReceiptService {
  constructor(private http: _HttpClient) {}

  waitForReceipt(job: ProductionLabelJob): Observable<void> {
    if (!job.transactionId || !job.warehouseId || !job.workOrderId || !job.labels.length || job.labels.some(label => !label.lpn)) {
      throw new Error('Missing production transaction or LPN information.');
    }
    return timer(0, 750).pipe(
      // Never overlap checks while an earlier request is still running.
      exhaustMap(() => forkJoin(job.labels.map(label => {
        const params = new HttpParams().set('warehouseId', job.warehouseId)
          .set('lpn', label.lpn).set('includeDetails', false);
        return this.http.get('inventory/inventories', params).pipe(
          timeout(10000),
          map(response => (response.data ?? []).some((inventory: {
            lpn?: string; createInventoryTransactionId?: number; workOrderId?: number; quantity?: number;
          }) => inventory.lpn === label.lpn && inventory.createInventoryTransactionId === job.transactionId &&
            inventory.workOrderId === job.workOrderId && (inventory.quantity ?? 0) > 0)),
          // A query failure is not evidence that the production transaction failed.
          catchError(() => of(false))
        );
      }))),
      filter(results => results.every(Boolean)),
      take(1),
      timeout(120000),
      map(() => undefined)
    );
  }
}
