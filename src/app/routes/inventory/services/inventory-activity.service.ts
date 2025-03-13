import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client } from '../../common/models/client';
import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Page } from '../../util/models/Page';
import { InventoryActivity } from '../models/inventory-activity';
import { InventoryActivityType } from '../models/inventory-activity-type.enum';
import { ItemFamily } from '../models/item-family';

@Injectable({
  providedIn: 'root',
})
export class InventoryActivityService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private utilService: UtilService,
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
     
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (itemName) {
      params = params.append('itemName', this.utilService.encodeHttpParameter(itemName.trim())); 
    }
    if (clients && clients.length > 0) {
      params = params.append('clients', this.utilService.encodeHttpParameter(clients.join(',')));  
    }
    if (itemFamilies && itemFamilies.length > 0) {
      params = params.append('item_families', this.utilService.encodeHttpParameter(itemFamilies.join(',')));  
    }
    if (location) {
      params = params.append('location', this.utilService.encodeHttpParameter(location.trim()));   
    }
    if (lpn) {
      params = params.append('lpn', this.utilService.encodeHttpParameter(lpn.trim()));   
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
      params = params.append('username', this.utilService.encodeHttpParameter(username.trim()));   
    }
    if (rfCode) {
      params = params.append('rfCode', this.utilService.encodeHttpParameter(rfCode.trim()));   
    } 
    
    return this.http.get(`inventory/inventory-activities`, params).pipe(map(res => res.data));
  }
  
  getPageableInventoryActivities(
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
    pageIndex?: number, 
    pageSize?: number
  ): Observable<Page<InventoryActivity[]>> {
    
    let params = new HttpParams(); 
     
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (itemName) {
      params = params.append('itemName', this.utilService.encodeHttpParameter(itemName.trim())); 
    }
    if (clients && clients.length > 0) {
      params = params.append('clients', this.utilService.encodeHttpParameter(clients.join(',')));  
    }
    if (itemFamilies && itemFamilies.length > 0) {
      params = params.append('item_families', this.utilService.encodeHttpParameter(itemFamilies.join(',')));  
    }
    if (location) {
      params = params.append('location', this.utilService.encodeHttpParameter(location.trim()));   
    }
    if (lpn) {
      params = params.append('lpn', this.utilService.encodeHttpParameter(lpn.trim()));   
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
      params = params.append('username', this.utilService.encodeHttpParameter(username.trim()));   
    }
    if (rfCode) {
      params = params.append('rfCode', this.utilService.encodeHttpParameter(rfCode.trim()));   
    } 
    
    return this.http.get(`inventory/inventory-activities/pagination`, params).pipe(map(res => res.data));
  }
}
