import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service'; 
import { AlertTemplate } from '../models/alert-template';

@Injectable({
  providedIn: 'root'
})
export class AlertTemplateService {
  constructor(private http: _HttpClient, private companyService: CompanyService) {}

  getAlertTemplates( type?: string,  deliveryChannel?: string,): Observable<AlertTemplate[]> {
    let url = `resource/alert-templates?companyId=${this.companyService.getCurrentCompany()?.id}`;
      
    if (type) {
      url = `${url}&type=${type}`;
    }
    if (deliveryChannel) {
      url = `${url}&deliveryChannel=${deliveryChannel}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getAlertTemplate(id: number): Observable<AlertTemplate> {
    return this.http.get(`resource/alert-templates/${id}`).pipe(map(res => res.data));
  }
  addAlertTemplate(alertSubscription: AlertTemplate): Observable<AlertTemplate> {
    return this.http.put(`resource/alert-templates?companyId=${this.companyService.getCurrentCompany()?.id}`, alertSubscription).pipe(map(res => res.data));
  } 
  changeAlertTemplate(alertSubscription: AlertTemplate): Observable<AlertTemplate> {
    return this.http.post(`resource/alert-templates/${alertSubscription.id}?companyId=${this.companyService.getCurrentCompany()?.id}`, alertSubscription).pipe(map(res => res.data));
  } 
 
  removeAlertTemplate(alertSubscription: AlertTemplate): Observable<AlertTemplate> {
    return this.http.delete(`resource/alert-templates/${alertSubscription.id}?companyId=${this.companyService.getCurrentCompany()?.id}`).pipe(map(res => res.data));
  }

}
