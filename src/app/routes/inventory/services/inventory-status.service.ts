 
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryStatus } from '../models/inventory-status';

@Injectable({
  providedIn: 'root',
})
export class InventoryStatusService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private utilService: UtilService,
    private warehouseService: WarehouseService,
  ) {}

  loadInventoryStatuses(refresh: boolean = true): Observable<InventoryStatus[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(
        `inventory.InventoryStatuses.${this.warehouseService.getCurrentWarehouse().id}`,
      );
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/inventory-statuses?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(
        tap(res =>
          this.localStorageService.setItem(
            `inventory.InventoryStatuses.${this.warehouseService.getCurrentWarehouse().id}`,
            res,
          ),
        ),
      );
  }
  getInventoryStatuses(name?: string, availableStatusFlag?: boolean): Observable<InventoryStatus[]> {
    let params = `warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (name) { 
      params = `${params}&itemName=${this.utilService.encodeValue(name.trim())}`;
    }
    if (availableStatusFlag != null) {
      params = `${params}&availableStatusFlag=${availableStatusFlag}`;
    }

    const url = `inventory/inventory-statuses?${params}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  getAvailableInventoryStatuses(): Observable<InventoryStatus[]> {
    return this.getInventoryStatuses(undefined, true);
  }
  getInventoryStatus(id: number): Observable<InventoryStatus> {
    return this.http.get(`inventory/inventory-statuses/${id}`).pipe(map(res => res.data));
  }
  addInventoryStatus(inventoryStatus: InventoryStatus): Observable<InventoryStatus> {
    return this.http.put(`inventory/inventory-statuses?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, 
        inventoryStatus).pipe(map(res => res.data));
  }
  changeInventoryStatus(inventoryStatus: InventoryStatus): Observable<InventoryStatus> {
    return this.http.post(`inventory/inventory-statuses/${inventoryStatus.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, 
        inventoryStatus).pipe(map(res => res.data));
  }
  removeInventoryStatus(id: number): Observable<InventoryStatus> {
    return this.http.delete(`inventory/inventory-statuses/${id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`).pipe(map(res => res.data));
  }
}
