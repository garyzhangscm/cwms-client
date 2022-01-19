import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { AlertSubscription } from '../models/alert-subscription';

@Injectable({
  providedIn: 'root'
})
export class AlertSubscriptionService {
  constructor(private http: _HttpClient, private companyService: CompanyService) {}

  getAlertSubscriptions(username?: string,  type?: string,  deliveryChannel?: string,): Observable<AlertSubscription> {
    let url = `resource/alert-subscriptions?companyId=${this.companyService.getCurrentCompany()?.id}`;
     
    if (username) {
      url = `${url}&username=${username}`;
    }
    if (type) {
      url = `${url}&type=${type}`;
    }
    if (deliveryChannel) {
      url = `${url}&deliveryChannel=${deliveryChannel}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getAlertSubscription(id: number): Observable<AlertSubscription> {
    return this.http.get(`resource/alert-subscriptions/${id}`).pipe(map(res => res.data));
  }
  addAlertSubscription(department: AlertSubscription): Observable<AlertSubscription> {
    return this.http.put(`resource/alert-subscriptions`, department).pipe(map(res => res.data));
  } 
 
  removeAlertSubscription(department: AlertSubscription): Observable<AlertSubscription> {
    return this.http.delete(`resource/alert-subscriptions/${department.id}`).pipe(map(res => res.data));
  }
}
