import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Alert } from '../models/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private http: _HttpClient, private companyService: CompanyService, 
    private dateTimeService: DateTimeService,
    private utilService: UtilService) {}

  getAlerts(type?: string, status?: string, keyWords?: string, 
    startTime?: Date, endTime?:Date, date?: Date): Observable<Alert[]> {
      
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
     
    if (type) { 
      params = params.append('type', this.utilService.encodeHttpParameter(type.trim())); 
    }

    if (status) { 
      params = params.append('status', this.utilService.encodeHttpParameter(status.trim())); 
    }
    if (keyWords) {  
      params = params.append('keyWords', this.utilService.encodeHttpParameter(keyWords.trim())); 
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
    return this.http.get(`resource/alerts`, params).pipe(map(res => res.data));
  }

  getAlert(id: number): Observable<Alert> {
    return this.http.get(`resource/alerts/${id}`).pipe(map(res => res.data));
  } 
  resetAlert(department: Alert): Observable<Alert> {
    return this.http.post(`resource/alerts/${department.id}/reset`, department).pipe(map(res => res.data));
  }
 
  
}
