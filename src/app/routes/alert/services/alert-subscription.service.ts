import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { AlertDeliveryChannel } from '../models/alert-delivery-channel';
import { AlertSubscription } from '../models/alert-subscription';
import { AlertType } from '../models/alert-type';

@Injectable({
  providedIn: 'root'
})
export class AlertSubscriptionService {
  constructor(private http: _HttpClient, private companyService: CompanyService, 
    private userService: UserService) {}

  getAlertSubscriptions(username?: string,  type?: string,  deliveryChannel?: string,): Observable<AlertSubscription[]> {
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
  addAlertSubscription(alertSubscription: AlertSubscription): Observable<AlertSubscription> {
    return this.http.put(`resource/alert-subscriptions`, alertSubscription).pipe(map(res => res.data));
  } 
 
  removeAlertSubscription(alertSubscription: AlertSubscription): Observable<AlertSubscription> {
    return this.http.delete(`resource/alert-subscriptions/${alertSubscription.id}`).pipe(map(res => res.data));
  }

  subscribe(alertType: AlertType, alertDeliveryChannel: AlertDeliveryChannel): Observable<AlertSubscription> {
    
    let url = `resource/alert-subscriptions/subscribe?companyId=${this.companyService.getCurrentCompany()?.id}`;
    url = `${url}&alertType=${alertType}`;
    url = `${url}&alertDeliveryChannel=${alertDeliveryChannel}`;
    url = `${url}&username=${this.userService.getCurrentUsername()}`;
    return this.http.post(url).pipe(map(res => res.data));
  } 
  unsubscribe(alertType: AlertType, alertDeliveryChannel: AlertDeliveryChannel): Observable<AlertSubscription> {
    
    let url = `resource/alert-subscriptions/unsubscribe?companyId=${this.companyService.getCurrentCompany()?.id}`;
    url = `${url}&alertType=${alertType}`;
    url = `${url}&alertDeliveryChannel=${alertDeliveryChannel}`;
    url = `${url}&username=${this.userService.getCurrentUsername()}`;
    return this.http.post(url).pipe(map(res => res.data));
  } 
  
  changeKeyWords(alertType: AlertType, alertDeliveryChannel: AlertDeliveryChannel, keyWordsList: string): Observable<AlertSubscription> {
    
    let url = `resource/alert-subscriptions/change-key-words?companyId=${this.companyService.getCurrentCompany()?.id}`;
    url = `${url}&alertType=${alertType}`;
    url = `${url}&alertDeliveryChannel=${alertDeliveryChannel}`;
    url = `${url}&username=${this.userService.getCurrentUsername()}`;
    url = `${url}&keyWordsList=${keyWordsList}`;
    return this.http.post(url).pipe(map(res => res.data));
  } 
 

}
