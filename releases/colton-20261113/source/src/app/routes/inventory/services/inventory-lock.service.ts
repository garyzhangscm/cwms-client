 
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Inventory } from '../models/inventory';
import { InventoryLock } from '../models/inventory-lock';
import { ItemSampling } from '../models/item-sampling';

@Injectable({
  providedIn: 'root'
})
export class InventoryLockService {

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private utilService: UtilService
  ) { }

  getInventoryLocks(name?: string): Observable<InventoryLock[]> {
    
    let url = `inventory/inventory-lock`;
     
    let params = new HttpParams(); 
    
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    
    if (name) {
      params = params.append('name', name.trim());  
    }
    
    
    return this.http.get(url, params).pipe(map(res => res.data));
  }
   
  getInventoryLock(id: number): Observable<InventoryLock> {
    
    let url = `inventory/inventory-lock/${id}`;
     
    return this.http.get(url).pipe(map(res => res.data));
  }
  

  addInventoryLock(inventoryLock: InventoryLock): Observable<InventoryLock> {
    
    let url = `inventory/inventory-lock?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.put(url, inventoryLock).pipe(map(res => res.data));
  }

  changeInventoryLock(inventoryLock: InventoryLock): Observable<InventoryLock> {
    
    let url = `inventory/inventory-lock/${inventoryLock.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.post(url, inventoryLock).pipe(map(res => res.data));
  }
  
  removeInventoryLock(inventoryLockId: number): Observable<InventoryLock> {
    
    let url = `inventory/inventory-lock/${inventoryLockId}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.delete(url).pipe(map(res => res.data));
  }

  disableInventoryLock(inventoryLock: InventoryLock): Observable<InventoryLock> {
    
    let url = `inventory/inventory-lock/${inventoryLock.id}/disable?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }
  
  enableInventoryLock(inventoryLock: InventoryLock): Observable<InventoryLock> {
    
    let url = `inventory/inventory-lock/${inventoryLock.id}/enable?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }
  
  
  unlockInventory(inventoryLock: InventoryLock, inventory: Inventory): Observable<InventoryLock> {
    
    let url = `inventory/inventory-lock/${inventoryLock.id}/unlock?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&inventoryId=${inventory.id}`;
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }
  
  getLockedInventory(inventoryLock: InventoryLock): Observable<Inventory[]> {
    
    let url = `inventory/inventory-lock/${inventoryLock.id}/lockedInventory?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.get(url).pipe(map(res => res.data));
  }
}
