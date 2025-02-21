

import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillingRequest } from '../models/billing-request';

@Injectable({
  providedIn: 'root'
})
export class BillingRequestService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService ,
    private dateTimeService: DateTimeService,
    private utilService: UtilService) {}

  getBillingRequests(clientId?: number, number?: string, referenceNumber?: string): Observable<BillingRequest[]> {
    let url = `admin/billing-requests?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    if (clientId) {
      url = `${url}&clientId=${clientId}`;
    }
     
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    } 

    return this.http.get(url).pipe(map(res => res.data));
  }
  generateBillingRequests(startTime: Date, endTime: Date, clientId?: number, number?: string, 
    serialize?: boolean, includeDaysSinceInWarehouseForStorageFee?: boolean): Observable<BillingRequest[]> {
    let url = `admin/billing-requests`;
    
    
    let params = new HttpParams(); 
 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
     
    params = params.append('startTime',  
        this.dateTimeService.getISODateTimeString(this.dateTimeService.getDayStartTime(startTime))); 
    
    params = params.append('endTime', 
        this.dateTimeService.getISODateTimeString(this.dateTimeService.getDayEndTime(endTime))); 
    
    
    if (clientId) {
      params = params.append('clientId', clientId);  
    }
     
    if (number) {
      params = params.append('number', this.utilService.encodeValue(number.trim()));  
    }  
    if (serialize != null) {
      params = params.append('serialize', serialize);  
    }
    if (includeDaysSinceInWarehouseForStorageFee != null) {
      params = params.append('includeDaysSinceInWarehouseForStorageFee', includeDaysSinceInWarehouseForStorageFee);  
    }
    
    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
}
