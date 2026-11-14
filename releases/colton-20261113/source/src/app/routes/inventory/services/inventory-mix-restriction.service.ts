import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryMixRestriction } from '../models/inventory-mix-restriction';
import { InventoryStatus } from '../models/inventory-status';

@Injectable({
  providedIn: 'root'
})
export class InventoryMixRestrictionService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
  ) {}
 
  getInventoryMixRestrictions(clientId?: number, 
    locationId?: number, locationGroupId?: number, locationGroupTypeId?: number, 
    locationName?: string): Observable<InventoryMixRestriction[]> {

      let params = new HttpParams(); 

      params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
 
    
      if (clientId != null) { 
        params = params.append('clientId', clientId); 
      }
      if (locationId != null) { 
        params = params.append('locationId', locationId); 
      }
      if (locationGroupId != null) { 
        params = params.append('locationGroupId', locationGroupId); 
      }
      if (locationGroupTypeId != null) { 
        params = params.append('locationGroupTypeId', locationGroupTypeId); 
      }
      if (locationName != null) { 
        params = params.append('locationName', locationName); 
      }

      const url = `inventory/inventory-mix-restriction`;
      return this.http.get(url, params).pipe(map(res => res.data));
  }
   
  getInventoryMixRestriction(id: number): Observable<InventoryMixRestriction> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    return this.http.get(`inventory/inventory-mix-restriction/${id}`, params).pipe(map(res => res.data));
  }

  addInventoryMixRestriction(inventoryMixRestriction: InventoryMixRestriction): Observable<InventoryMixRestriction> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    return this.http.put(`inventory/inventory-mix-restriction`, 
        inventoryMixRestriction, params).pipe(map(res => res.data));
  }
  changeInventoryMixRestriction(inventoryMixRestriction: InventoryMixRestriction): Observable<InventoryMixRestriction> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    return this.http.post(`inventory/inventory-mix-restriction/${inventoryMixRestriction.id}`, 
    inventoryMixRestriction, params).pipe(map(res => res.data));
  }
  removeInventoryMixRestriction(id: number): Observable<InventoryMixRestriction> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    return this.http.delete(`inventory/inventory-mix-restriction/${id}`, params).pipe(map(res => res.data));
  }
}
