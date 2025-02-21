import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationWorkOrder } from '../models/integration-work-order';

@Injectable({
  providedIn: 'root'
})
export class IntegrationWorkOrderDataService {
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    private dateTimeService: DateTimeService,
    private companyService: CompanyService,) {}

  getData(startTime?: Date, endTime?:Date, date?: Date, statusList?: string, id?: number, 
    warehouseName?: string, workOrderNumber?: string): Observable<IntegrationWorkOrder[]> {
      
    let params = new HttpParams();
           
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('companyCode', this.companyService.getCurrentCompany()!.code); 
    
    let url = `integration/integration-data/work-orders`;

    if (warehouseName) {
      params = params.append('warehouseName', warehouseName); 
         
    }
    if (workOrderNumber) {
      params = params.append('workOrderNumber', workOrderNumber); 
         
    }
    if (startTime) {
      params = params.append('startTime', this.dateTimeService.getISODateTimeString(startTime));  
    }
    if (endTime) {
      params = params.append('endTime', this.dateTimeService.getISODateTimeString(endTime));  
    }
    if (date) {
      params = params.append('date', this.dateTimeService.getISODateString(date));  
    }
    if (statusList) {
      params = params.append('statusList', statusList);  
    }
    if (id) {
      params = params.append('id', id);  
    }
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  resend(id: number) : Observable<IntegrationWorkOrder> {
    let url = `integration/integration-data/work-orders/${id}/resend`;
    
    return this.http.post(url).pipe(map(res => res.data));
  }
}
