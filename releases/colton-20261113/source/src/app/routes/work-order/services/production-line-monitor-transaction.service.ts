
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineMonitorTransaction } from '../models/production-line-monitor-transaction';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineMonitorTransactionService {
  constructor(private http: _HttpClient, 
    private dateTimeService: DateTimeService,
    private utilService: UtilService,
    private warehouseService: WarehouseService) {}

  getProductionLineMonitorTransactions(productionLineMonitorName?: string, 
    productionLineName?: string, productionLineId?: number, 
    startTime?: Date, endTime?:Date, date?: Date): Observable<ProductionLineMonitorTransaction[]> {
    let url =  `workorder/production-line-monitor-transactions?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
     
    if (productionLineMonitorName) {
      url = `${url}&productionLineMonitorName=${this.utilService.encodeValue(productionLineMonitorName.trim())}`;
    }
    if (productionLineName) {
      url = `${url}&productionLineName=${this.utilService.encodeValue(productionLineName.trim())}`;
    }
    if (productionLineId != null) {
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
  
  addProductionLineMonitorTransaction(
    productionLineMonitorName: string,
    cycleTime: number
  ): Observable<ProductionLineMonitorTransaction> {
    let url =  `workorder/production-line-monitor-transactions?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    url = `${url}&productionLineMonitorName=${productionLineMonitorName}`;
    url = `${url}&cycleTime=${cycleTime}`;
    return this.http.put(url).pipe(map(res => res.data));
  }
}
