import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationItemData } from '../models/integration-item-data'; 

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemDataService {
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    private dateTimeService: DateTimeService,) {}
	
	
    getData(startTime?: Date, endTime?:Date, date?: Date): Observable<IntegrationItemData[]> {
      let url = `integration/integration-data/items?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
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

    
    resend(id: number) : Observable<IntegrationItemData> {
      let url = `integration/integration-data/items/${id}/resend`;
      
      return this.http.post(url).pipe(map(res => res.data));
    }
}
