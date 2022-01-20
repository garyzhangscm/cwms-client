import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationItemFamilyData } from '../models/integration-item-family-data'; 

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemFamilyDataService {
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    private dateTimeService: DateTimeService,
    private companyService: CompanyService,) {}

    getData(startTime?: Date, endTime?:Date, date?: Date, statusList?: string, id?: number, warehouseName?: string): Observable<IntegrationItemFamilyData[]> {
      let url = `integration/integration-data/item-families?companyCode=${this.companyService.getCurrentCompany()?.code}`;
      
      if (warehouseName) {
        
        url = `${url}&warehouseName=${warehouseName}`;
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
      if (statusList) {
        url = `${url}&statusList=${statusList}`;
      }
      if (id) {
        url = `${url}&id=${id}`;
      }
      return this.http.get(url).pipe(map(res => res.data));
    }

    resend(id: number) : Observable<IntegrationItemFamilyData> {
      let url = `integration/integration-data/item-families/${id}/resend`;
      
      return this.http.post(url).pipe(map(res => res.data));
    }
    
}
