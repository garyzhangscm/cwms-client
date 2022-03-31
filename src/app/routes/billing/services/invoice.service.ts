import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
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
    private dateTimeService: DateTimeService,) {}

  getInvoices(warehouseId?: number, clientId?: number, number?: string, referenceNumber?: string): Observable<Invoice[]> {
    let url = `admin/invoices?companyId=${this.companyService.getCurrentCompany()!.id}`;
    if (warehouseId) {
      url = `${url}&warehouseId=${warehouseId}`;
    }
    if (clientId) {
      url = `${url}&clientId=${clientId}`;
    }
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    if (referenceNumber) {
      url = `${url}&referenceNumber=${httpUrlEncodingCodec.encodeValue(referenceNumber.trim())}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
  
  generateInvoiceFromBillingRequest( number: string, startTime: Date, endTime:Date, billingRequest: BillingRequest[],
    clientId?: number, referenceNumber?: string, comment?: string): Observable<Invoice> {
       

      const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 

      let url = `admin/invoices/from-billing-request?companyId=${this.companyService.getCurrentCompany()!.id}`;
      url = `${url}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`; 
      url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`; 
      url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;  

      if (clientId) {
        url = `${url}&clientId=${clientId}`;
      }
      
      if (comment) {
        url = `${url}&comment=${httpUrlEncodingCodec.encodeValue(comment.trim())}`;
      }

      return this.http.post(url, billingRequest).pipe(map(res => res.data));
  }
}
