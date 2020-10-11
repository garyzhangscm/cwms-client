import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderProduceTransactionService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  saveWorkOrderProduceTransaction(
    workOrderProduceTransaction: WorkOrderProduceTransaction,
  ): Observable<WorkOrderProduceTransaction> {
    return this.http
      .post(`workorder/work-order-produce-transactions`, workOrderProduceTransaction)
      .pipe(map(res => res.data));
  }
}
