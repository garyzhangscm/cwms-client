import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationReceiptConfirmation } from '../models/integration-receipt-confirmation'; 

@Injectable({
  providedIn: 'root',
})
export class IntegrationReceiptConfirmationService {
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    private dateTimeService: DateTimeService,) {}

    getData(startTime?: Date, endTime?:Date, date?: Date): Observable<IntegrationReceiptConfirmation[]> {
      let url = `integration/integration-data/receipt-confirmations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
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
