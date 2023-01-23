import { HttpParams, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client } from '../../common/models/client';
import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Inventory } from '../models/inventory';
import { InventoryActivity } from '../models/inventory-activity';
import { InventoryActivityType } from '../models/inventory-activity-type.enum';
import { ItemFamily } from '../models/item-family';

@Injectable({
  providedIn: 'root',
})
export class InventoryActivityService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private dateTimeService: DateTimeService) {}
  getInventoryActivities(
    clients?: Client[],
    itemFamilies?: ItemFamily[],
    itemName?: string,
    location?: string,
    lpn?: string,
    inventoryActivityType?: InventoryActivityType,
    beginDate?: Date,
    endDate?: Date,
    date?: Date,
    username?: string,
    rfCode?: string, 
  ): Observable<InventoryActivity[]> {
    
    let params = new HttpParams();
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
     
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (itemName) {
      params = params.append('itemName', httpUrlEncodingCodec.encodeValue(itemName.trim())); 
    }
    if (clients && clients.length > 0) {
      params = params.append('clients', httpUrlEncodingCodec.encodeValue(clients.join(',')));  
    }
    if (itemFamilies && itemFamilies.length > 0) {
      params = params.append('item_families', httpUrlEncodingCodec.encodeValue(itemFamilies.join(',')));  
    }
    if (location) {
      params = params.append('location', httpUrlEncodingCodec.encodeValue(location.trim()));   
    }
    if (lpn) {
      params = params.append('lpn', httpUrlEncodingCodec.encodeValue(lpn.trim()));   
    }
    if (inventoryActivityType) {
      params = params.append('inventoryActivityType',inventoryActivityType);   
    } 
    
    if (beginDate) {
      params = params.append('beginDate', this.dateTimeService.getISODateString(beginDate));   
    }
    if (endDate) {
      params = params.append('endDate', this.dateTimeService.getISODateString(endDate));   
    }

    if (date) {
      params = params.append('date', this.dateTimeService.getISODateString(date));   
    }
    if (username) {
      params = params.append('username', httpUrlEncodingCodec.encodeValue(username.trim()));   
    }
    if (rfCode) {
      params = params.append('rfCode', httpUrlEncodingCodec.encodeValue(rfCode.trim()));   
    } 
    
    return this.http.get(`inventory/inventory-activities`, params).pipe(map(res => res.data));
  }
}
