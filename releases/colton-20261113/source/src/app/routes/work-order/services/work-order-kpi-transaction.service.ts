import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderKpiTransactionService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkOrderKPITransactions(workOrderNumber?: string, username?: string): Observable<WorkOrderKpiTransaction[]> {
    let url = `workorder/work-order-kpi-transactions?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (workOrderNumber) {
      url = `${url}&workOrderNumber=${workOrderNumber}`;
    }
    if (username) {
      url = `${url}&username=${username}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getWorkOrderKPITransaction(id: number): Observable<WorkOrderKpiTransaction> {
    return this.http.get(`workorder/work-order-kpi-transactions/${id}`).pipe(map(res => res.data));
  }
  addWorkOrderKPITransaction(workOrderKpiTransaction: WorkOrderKpiTransaction): Observable<WorkOrderKpiTransaction> {
    return this.http.post(`workorder/work-order-kpi-transactions`, workOrderKpiTransaction).pipe(map(res => res.data));
  }
  changeWorkOrderKPITransaction(workOrderKpiTransaction: WorkOrderKpiTransaction): Observable<WorkOrderKpiTransaction> {
    return this.http
      .get(`workorder/work-order-kpi-transactions/${workOrderKpiTransaction.id}`, workOrderKpiTransaction)
      .pipe(map(res => res.data));
  }
}
