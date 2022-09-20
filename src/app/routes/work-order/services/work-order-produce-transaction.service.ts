import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderProduceTransactionService {
  constructor(private http: _HttpClient,
    private dateTimeService: DateTimeService, private warehouseService: WarehouseService) {}

  saveWorkOrderProduceTransaction(
    workOrderProduceTransaction: WorkOrderProduceTransaction,
  ): Observable<WorkOrderProduceTransaction> {
    return this.http
      .post(`workorder/work-order-produce-transactions`, workOrderProduceTransaction)
      .pipe(map(res => res.data));
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
