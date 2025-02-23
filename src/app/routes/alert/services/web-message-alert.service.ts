import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WebMessageAlert } from '../models/web-message-alert';
 
@Injectable({
  providedIn: 'root'
})
export class WebMessageAlertService {
  constructor(private http: _HttpClient, private companyService: CompanyService, 
    private userService: UserService) {}

    getUserInreadWebMessageAlertCount(): Observable<number> {
      // we will need to add _allow_anonymous=true to void delon's auth issue

      let url = `resource/web-message-alerts/new-message-count?companyId=${this.companyService.getCurrentCompany()?.id}`;
      
      url = `${url}&username=${this.userService.getCurrentUsername()}`;
  
      
      return this.http.get(url).pipe(map(res => res.data));
    }
    
    getUserWebMessageAlerts(readFlag?: boolean): Observable<WebMessageAlert[]> {
    let url = `resource/web-message-alerts?companyId=${this.companyService.getCurrentCompany()?.id}`;
    
    url = `${url}&username=${this.userService.getCurrentUsername()}`;

    if (readFlag != null) {
      url = `${url}&readFlag=${readFlag}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  
  getUserUnreadWebMessageAlerts(): Observable<WebMessageAlert[]> {
    return this.getUserWebMessageAlerts(false);
  }

  
  readWebMessageAlerts(id?: number): Observable<WebMessageAlert[]> {
    let url = `resource/web-message-alerts/${id}/read?companyId=${this.companyService.getCurrentCompany()?.id}`;
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }
 
}
