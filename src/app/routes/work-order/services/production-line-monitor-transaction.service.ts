import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineMonitorTransaction } from '../models/production-line-monitor-transaction';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineMonitorTransactionService {
  constructor(private http: _HttpClient, 
    private dateTimeService: DateTimeService,
    private warehouseService: WarehouseService) {}

  getProductionLineMonitorTransactions(productionLineMonitorName?: string, 
    productionLineName?: string, productionLineId?: number, 
    startTime?: Date, endTime?:Date, date?: Date): Observable<ProductionLineMonitorTransaction[]> {
    let url =  `workorder/production-line-monitor-transactions?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (productionLineMonitorName) {
      url = `${url}&productionLineMonitorName=${httpUrlEncodingCodec.encodeValue(productionLineMonitorName.trim())}`;
    }
    if (productionLineName) {
      url = `${url}&productionLineName=${httpUrlEncodingCodec.encodeValue(productionLineName.trim())}`;
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
}
