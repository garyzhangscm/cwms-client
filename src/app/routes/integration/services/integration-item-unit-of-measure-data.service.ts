import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationItemUnitOfMeasureData } from '../models/integration-item-unit-of-measure-data'; 

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemUnitOfMeasureDataService {
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    private dateTimeService: DateTimeService,) {}

	
    getData(startTime?: Date, endTime?:Date, date?: Date, statusList?: string, id?: number): Observable<IntegrationItemUnitOfMeasureData[]> {
      let url = `integration/integration-data/item-unit-of-measures?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
      if (startTime) {
        url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
      }
      if (endTime) {
        url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
      }
      if (date) {
        url = `${url}&date=${this.dateTimeService.getISODateString(date)}`;
      }
      if (statusList) {
        url = `${url}&statusList=${statusList}`;
      }
      if (id) {
        url = `${url}&id=${id}`;
      }
      return this.http.get(url).pipe(map(res => res.data));
    }

    resend(id: number) : Observable<IntegrationItemUnitOfMeasureData> {
      let url = `integration/integration-data/item-unit-of-measures/${id}/resend`;
      
      return this.http.post(url).pipe(map(res => res.data));
    }
    
}
