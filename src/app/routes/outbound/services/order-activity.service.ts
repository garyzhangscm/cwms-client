import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OrderActivity } from '../models/order-activity';

@Injectable({
  providedIn: 'root'
})
export class OrderActivityService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private dateTimeService: DateTimeService) {}

  getOrderActivities( 
    beginDateTime?: Date,
    endDateTime?: Date,
    date?: Date,
    username?: string,
    rfCode?: string,
    orderNumber?: string,
    shipmentNumber?: string,
    shipmentLineNumber?: string,
    pickNumber?: string,
    orderId?: number,
    shipmentId?: number,
    shipmentLineId?: number,
    pickId?: number,
    shortAllocationId?: number
    
  ): Observable<OrderActivity[]> {
    let url = `outbound/order-activities?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   
    if (beginDateTime) {
      url = `${url}&beginDateTime=${this.dateTimeService.getISODateTimeString(beginDateTime)}`;
    }
    if (endDateTime) {
      url = `${url}&endDateTime=${this.dateTimeService.getISODateTimeString(endDateTime)}`;
    }
    if (date) {
      url = `${url}&date=${this.dateTimeService.getISODateString(date)}`;
    }

    if (username) {
      url = `${url}&username=${username}`;
    }
    if (rfCode) {
      url = `${url}&rfCode=${rfCode}`;
    }
    
    if (orderNumber) {
      url = `${url}&orderNumber=${orderNumber}`;
    }
    if (shipmentNumber) {
      url = `${url}&shipmentNumber=${shipmentNumber}`;
    }
    if (shipmentLineNumber) {
      url = `${url}&shipmentLineNumber=${shipmentLineNumber}`;
    }
    if (pickNumber) {
      url = `${url}&pickNumber=${pickNumber}`;
    }
 
    
    if (orderId) {
      url = `${url}&orderId=${orderId}`;
    }
    if (shipmentId) {
      url = `${url}&shipmentId=${shipmentId}`;
    }
    if (shipmentLineId) {
      url = `${url}&shipmentLineId=${shipmentLineId}`;
    }
    if (pickId) {
      url = `${url}&pickId=${pickId}`;
    }
    if (shortAllocationId) {
      url = `${url}&shortAllocationId=${shortAllocationId}`;
    }
 
    return this.http.get(url).pipe(map(res => res.data));
  }
}
