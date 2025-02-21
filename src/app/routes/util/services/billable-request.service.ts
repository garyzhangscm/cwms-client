import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
 
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { BillableRequest } from '../models/billable-request';
import { BillableRequestSummaryByCompany } from '../models/billable-request-summary-by-company';
import { DateTimeService } from './date-time.service';

@Injectable({
  providedIn: 'root'
})
export class BillableRequestService {

  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService,
    private dateTimeService: DateTimeService,
  ) {}

  
  getBillableRequest(warehouseId?: number, startTime?: Date, endTime?:Date, date?: Date): Observable<BillableRequest[]> {

    let params = new HttpParams();
           
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
     
    if (warehouseId) {
      params = params.append('warehouseId', warehouseId);  
    }

    
    return this.http.get(`admin/billing/billable-request`, params).pipe(map(res => res.data));
  }
  
  getBillableRequestSummaryByCompany(startTime?: Date, endTime?:Date, date?: Date): Observable<BillableRequestSummaryByCompany[]> {
            

    let url = `admin/billing/billable-request-summary/${this.companyService.getCurrentCompany()!.id}?`;
    let params = new HttpParams();
    if (date) {
      date.setHours(0,0,0,0);
      params = params.append('startTime', this.dateTimeService.getISODateTimeString(date));  
      date.setHours(23,59,59,999);
      params = params.append('endTime',  this.dateTimeService.getISODateTimeString(date));  
      
    }
    else {

      if (startTime) {
        params = params.append('startTime', this.dateTimeService.getISODateTimeString(startTime));   
      }
      if (endTime) {
        params = params.append('endTime', this.dateTimeService.getISODateTimeString(endTime));    
      }
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }
}
