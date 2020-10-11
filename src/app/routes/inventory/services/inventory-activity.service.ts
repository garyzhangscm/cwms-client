import { Injectable } from '@angular/core';
import { Client } from '../../common/models/client';
import { ItemFamily } from '../models/item-family';
import { Observable } from 'rxjs';
import { Inventory } from '../models/inventory';
import { map } from 'rxjs/operators';
import { InventoryActivity } from '../models/inventory-activity';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryActivityType } from '../models/inventory-activity-type.enum';

@Injectable({
  providedIn: 'root',
})
export class InventoryActivityService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}
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
      params = `${params}&beginDateTime=${beginDateTime}`;
    }
    if (endDateTime) {
      params = `${params}&endDateTime=${endDateTime}`;
    }
    if (date) {
      params = `${params}&date=${date}`;
    }
    if (username) {
      params = `${params}&username=${username}`;
    }
    params = `${params}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = 'inventory/inventory-activities' + (params.length > 0 ? '?' + params : '');
    return this.http.get(url).pipe(map(res => res.data));
  }
}
