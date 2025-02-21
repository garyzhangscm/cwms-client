import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class QcInspectionService {

  constructor(private http: _HttpClient, private warehosueService: WarehouseService) {}
  
  getQCRequiredInventory(locationId?: number, locationName?: number, 
    locationGroupId?: number,
    itemId?: number, itemName?: string): Observable<Inventory[]> {

      let url = `inventory/inventories/qc-required?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
      if (locationId) {
        url = `${url}&locationId=${locationId}`;
      }
      if (locationName) {
        url = `${url}&locationName=${locationName}`;
      }
      if (locationGroupId) {
        url = `${url}&locationGroupId=${locationGroupId}`;
      }
      
      if (itemId) {
        url = `${url}&itemId=${itemId}`;
      }
      
      if (itemName) {
        url = `${url}&itemName=${itemName}`;
      }
      
      
      return this.http.get(url).pipe(map(res => res.data));
    }

}
