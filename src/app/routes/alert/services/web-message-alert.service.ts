import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WebMessageAlert } from '../models/web-message-alert';

import { type } from 'os';

@Injectable({
  providedIn: 'root'
})
export class WebMessageAlertService {
  constructor(private http: _HttpClient, private companyService: CompanyService, 
    private userService: UserService) {}

  getWebMessageAlerts(readFlag?: boolean): Observable<WebMessageAlert[]> {
    let url = `resource/web-message-alerts?companyId=${this.companyService.getCurrentCompany()?.id}`;
    
    url = `${url}&username=${this.userService.getCurrentUsername()}`;

    if (readFlag != null) {
      url = `${url}&readFlag=${readFlag}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  
  getUnreadWebMessageAlerts(): Observable<WebMessageAlert[]> {
    return this.getWebMessageAlerts(false);
  }

  
  readWebMessageAlerts(id?: number): Observable<WebMessageAlert[]> {
    let url = `resource/web-message-alerts/${id}/read?companyId=${this.companyService.getCurrentCompany()?.id}`;
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }
 
}
