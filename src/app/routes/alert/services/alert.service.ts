import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Alert } from '../models/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private http: _HttpClient, private companyService: CompanyService) {}

  getAlerts(type?: string, status?: string, keyWords?: string): Observable<Alert[]> {
    let url = `resource/alerts?companyId=${this.companyService.getCurrentCompany()?.id}`;
     
    if (type) {
      url = `${url}&type=${type}`;
    }

    if (status) {
      url = `${url}&status=${status}`;
    }
    if (keyWords) {
      const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
      url = `${url}&keyWords=${httpUrlEncodingCodec.encodeValue(keyWords.trim())}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getAlert(id: number): Observable<Alert> {
    return this.http.get(`resource/alerts/${id}`).pipe(map(res => res.data));
  } 
  resetAlert(department: Alert): Observable<Alert> {
    return this.http.post(`resource/alerts/${department.id}/reset`, department).pipe(map(res => res.data));
  }
 
  
}
