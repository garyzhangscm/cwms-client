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
    beginDateTime?: Date,
    endDateTime?: Date,
    date?: Date,
    username?: string,
    rfCode?: string,
  ): Observable<InventoryActivity[]> {
    let params = '';
    if (itemName) {
      params = `itemName=${itemName}`;
    }
    if (clients && clients.length > 0) {
      params = `${params}&clients=${clients.join(',')}`;
    }
    if (itemFamilies && itemFamilies.length > 0) {
      params = `${params}&item_families=${itemFamilies.join(',')}`;
    }
    if (location) {
      params = `${params}&location=${location}`;
    }
    if (lpn) {
      params = `${params}&lpn=${lpn}`;
    }
    if (inventoryActivityType) {
      params = `${params}&inventoryActivityType=${inventoryActivityType}`;
    }
    if (beginDateTime) {
      params = `${params}&beginDateTime=${this.dateTimeService.getISODateTimeString(beginDateTime)}`;
    }
    if (endDateTime) {
      params = `${params}&endDateTime=${this.dateTimeService.getISODateTimeString(endDateTime)}`;
    }
    if (date) {
      params = `${params}&date=${this.dateTimeService.getISODateString(date)}`;
    }
    if (username) {
      params = `${params}&username=${username}`;
    }
    if (rfCode) {
      params = `${params}&rfCode=${rfCode}`;
    }
    params = `${params}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = `inventory/inventory-activities${  params.length > 0 ? `?${  params}` : ''}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
}
