import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@env/environment';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderCompleteTransaction } from '../models/work-order-complete-transaction';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderCompleteTransactionService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  saveWorkOrderCompleteTransaction(
    workOrderCompleteTransaction: WorkOrderCompleteTransaction,
  ): Observable<WorkOrderCompleteTransaction> {
    const service = environment.production ? 'workorder' : 'workorder-completion-test';
    return this.http
      .post(`${service}/work-order-complete-transactions?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, workOrderCompleteTransaction)
      .pipe(map(res => res.data));
  }
}
