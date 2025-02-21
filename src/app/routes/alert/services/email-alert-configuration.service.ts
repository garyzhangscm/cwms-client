import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { EmailAlertConfiguration } from '../models/email-alert-configuration';

@Injectable({
  providedIn: 'root'
})
export class EmailAlertConfigurationService {
  constructor(private http: _HttpClient, private companyService: CompanyService) {}

  getEmailAlertConfigurations(): Observable<EmailAlertConfiguration> {
    let url = `resource/email-alert-configurations?companyId=${this.companyService.getCurrentCompany()?.id}`;
     

    return this.http.get(url).pipe(map(res => res.data));
  }

  getEmailAlertConfiguration(id: number): Observable<EmailAlertConfiguration> {
    return this.http.get(`resource/email-alert-configurations/${id}`).pipe(map(res => res.data));
  }
  addEmailAlertConfiguration(emailAlertConfiguration: EmailAlertConfiguration): Observable<EmailAlertConfiguration> {
    return this.http.put(`resource/email-alert-configurations`, emailAlertConfiguration).pipe(map(res => res.data));
  }
  changeEmailAlertConfiguration(emailAlertConfiguration: EmailAlertConfiguration): Observable<EmailAlertConfiguration> {
    return this.http.post(`resource/email-alert-configurations/${emailAlertConfiguration.id}`, emailAlertConfiguration).pipe(map(res => res.data));
  }
 
  removeEmailAlertConfiguration(emailAlertConfiguration: EmailAlertConfiguration): Observable<EmailAlertConfiguration> {
    return this.http.delete(`resource/email-alert-configurations/${emailAlertConfiguration.id}`).pipe(map(res => res.data));
  }
 
}
