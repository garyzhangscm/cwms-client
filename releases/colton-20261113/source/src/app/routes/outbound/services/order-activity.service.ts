

import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OrderActivity } from '../models/order-activity';

@Injectable({
  providedIn: 'root'
})
export class OrderActivityService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private utilService: UtilService,
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
    shortAllocationId?: number,
    clientId?:number
    
  ): Observable<OrderActivity[]> {
    const url = `outbound/order-activities`; 
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    
    if (beginDateTime) {
      params = params.append('beginDateTime', this.dateTimeService.getISODateTimeString(beginDateTime));  
    }
    if (endDateTime) {
      params = params.append('endDateTime', this.dateTimeService.getISODateTimeString(endDateTime));   
    }
    if (date) {
      params = params.append('date', this.dateTimeService.getISODateString(date));    
    }

    if (username) {
      params = params.append('username', username.trim());     
    }
    if (rfCode) {
      params = params.append('rfCode', rfCode.trim());  
    }
    
    if (orderNumber) {
      params = params.append('orderNumber', orderNumber.trim());   
    }
    if (shipmentNumber) {
      params = params.append('shipmentNumber', shipmentNumber.trim());   
    }
    if (shipmentLineNumber) {
      params = params.append('shipmentLineNumber', shipmentLineNumber.trim());    
    }
    if (pickNumber) {
      params = params.append('pickNumber', pickNumber.trim());     
    }
 
    
    if (orderId != null) {
      params = params.append('orderId', orderId);   
    }
    if (shipmentId != null) {
      params = params.append('shipmentId', shipmentId);    
    }
    if (shipmentLineId != null) {
      params = params.append('shipmentLineId', shipmentLineId);   
    }
    if (pickId != null) {
      params = params.append('pickId', pickId);   
    }
    if (shortAllocationId != null) {
      params = params.append('shortAllocationId', shortAllocationId);    
    }
    if (clientId != null) {
      params = params.append('clientId', clientId);    
    }
 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
}
