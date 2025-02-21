import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryAllocationSummary } from '../models/inventory-allocation-summary';

@Injectable({
  providedIn: 'root'
})
export class InventoryAllocationSummaryService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService) {}

  getInventoryAllocationSummary(
    itemId?: number,
    itemName?: string,
    locationId?: number,
    locationName?: string
  ): Observable<InventoryAllocationSummary[]> {

    let  url = `inventory/inventory-allocation-summary?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`; 
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }
    
    if (locationId) {
      url = `${url}&locationId=${locationId}`;
    }
    
    if (locationName) {
      url = `${url}&locationName=${locationName}`;
    }
    
 
    return this.http.get(url).pipe(map(res => res.data));
  }
}
