import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillingRequest } from '../models/billing-request';

@Injectable({
  providedIn: 'root'
})
export class BillingRequestService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService ,
    private dateTimeService: DateTimeService,) {}

  getBillingRequests(clientId?: number, number?: string, referenceNumber?: string): Observable<BillingRequest[]> {
    let url = `admin/billing-requests?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    if (clientId) {
      url = `${url}&clientId=${clientId}`;
    }
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    } 

    return this.http.get(url).pipe(map(res => res.data));
  }
  generateBillingRequests(startTime: Date, endTime: Date, clientId?: number, number?: string, 
    serialize?: boolean): Observable<BillingRequest[]> {
    let url = `admin/billing-requests?companyId=${this.companyService.getCurrentCompany()!.id}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
    url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
    
    if (clientId) {
      url = `${url}&clientId=${clientId}`;
    }
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }  
    if (serialize != null) {
      url = `${url}&serialize=${serialize}`;
    }
    
    return this.http.post(url).pipe(map(res => res.data));
  }
}
