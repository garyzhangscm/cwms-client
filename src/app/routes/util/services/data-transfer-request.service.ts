import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataTransferRequest } from '../models/data-transfer-request';
import { DataTransferRequestStatus } from '../models/data-transfer-request-status';
import { DataTransferRequestType } from '../models/data-transfer-request-type';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class DataTransferRequestService {

  constructor(
    private http: _HttpClient ,
    private utilService: UtilService,
  ) {}

  
  getDataTransferRequests(number?: string, companyCode?: string, companyId?: number, status?: DataTransferRequestStatus): Observable<DataTransferRequest[]> {
     

    let url = `admin/data-transfer`;
    if (number) {
      url = `${url}?number=${this.utilService.encodeValue(number)}`;
    }
    if (companyCode) {
      url = `${url}?companyCode=${this.utilService.encodeValue(companyCode)}`;
    }
    if (companyId) {
      url = `${url}?companyId=${companyId}`;
    }
    if (status) {
      url = `${url}?status=${status}`;
    }
     
    
    return this.http.get(url).pipe(map(res => res.data));
  }
  getDataTransferRequest(id: number): Observable<DataTransferRequest> {
    return this.http.get(`admin/data-transfer/${id}`).pipe(map(res => res.data));
  }

  addDataTransferRequest(number: string, companyId: number, description: string, 
     type: DataTransferRequestType): Observable<DataTransferRequest> {
      
      let params = new HttpParams();
      params = params.append('number', number);
      params = params.append('companyId', companyId);
      params = params.append('description', description);
      params = params.append('type', type);
      
    return this.http.put("admin/data-transfer", null, params).pipe(map(res => res.data));
  }
}
