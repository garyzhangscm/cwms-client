 
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
import { Invoice } from '../models/invoice';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService, 
    private dateTimeService: DateTimeService, 
    private utilService: UtilService,) {}

  getInvoices(warehouseId?: number, clientId?: number, number?: string, referenceNumber?: string): Observable<Invoice[]> {
    let url = `admin/invoices`;
    
    let params = new HttpParams(); 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    if (warehouseId) {
      params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    }
    if (clientId) { 
      params = params.append('clientId', clientId);  
    }
     
    if (number) {
      params = params.append('number', number);   
    }
    if (referenceNumber) {
      params = params.append('referenceNumber', referenceNumber.trim());   
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  generateInvoiceFromBillingRequest( number: string, startTime: Date, endTime:Date, billingRequest: BillingRequest[],
    clientId?: number, referenceNumber?: string, comment?: string): Observable<Invoice> {
 

      const url = `admin/invoices/from-billing-request`;
      
      let params = new HttpParams(); 
      
      params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
      params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
      params = params.append('number', this.utilService.encodeValue(number.trim())); 
      // params = params.append('startTime', this.dateTimeService.getISODateString(startTime)); 
      // params = params.append('endTime', this.dateTimeService.getISODateString(endTime));  
  
      params = params.append('startTime',  
      this.dateTimeService.getISODateTimeString(this.dateTimeService.getDayStartTime(startTime))); 
  
      params = params.append('endTime', 
          this.dateTimeService.getISODateTimeString(this.dateTimeService.getDayEndTime(endTime))); 

      if (clientId) {
        params = params.append('clientId', clientId);   
      }
      
      if (comment) {
        params = params.append('comment', this.utilService.encodeValue(comment.trim()));    
      }

      return this.http.post(url, billingRequest, params).pipe(map(res => res.data));
  }
}
