import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IntegrationDataService } from '../../integration/services/integration-data.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { BillableRequest } from '../models/billable-request';
import { BillableRequestSummaryByCompany } from '../models/billable-request-summary-by-company';

@Injectable({
  providedIn: 'root'
})
export class BillableRequestService {

  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService,
    private integrationDataService: IntegrationDataService
  ) {}

  
  getBillableRequest(warehouseId?: number, startTime?: Date, endTime?:Date, date?: Date): Observable<BillableRequest[]> {

    let url = `admin/billing/billable-request?companyId=${this.companyService.getCurrentCompany()!.id}`;
      
    if (warehouseId) {
      url = `${url}&warehouseId=${warehouseId}`;
    }
    if (startTime) {
      url = `${url}&startTime=${this.integrationDataService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.integrationDataService.getISODateTimeString(endTime)}`;
    }
    if (date) {
      url = `${url}&date=${this.integrationDataService.getISODateString(date)}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  
  getBillableRequestSummaryByCompany(startTime?: Date, endTime?:Date, date?: Date): Observable<BillableRequestSummaryByCompany[]> {

    let url = `admin/billing/billable-request-summary/${this.companyService.getCurrentCompany()!.id}?`;
      
    if (startTime) {
      url = `${url}&startTime=${this.integrationDataService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.integrationDataService.getISODateTimeString(endTime)}`;
    }
    if (date) {
      url = `${url}&date=${this.integrationDataService.getISODateString(date)}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
}
