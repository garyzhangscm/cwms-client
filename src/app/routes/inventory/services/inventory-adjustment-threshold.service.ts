import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { InventoryAdjustmentThreshold } from '../models/inventory-adjustment-threshold';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InventoryAdjustmentThresholdService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getInventoryAdjustmentThresholds(
    inventoryQuantityChangeTypes?: string,
    clientIds?: string,
    itemFamilyIds?: string,
    itemName?: string,
    username?: string,
    roleName?: string,
    enabled?: boolean,
  ): Observable<InventoryAdjustmentThreshold[]> {
    let params = `warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (itemName) {
      params = `${params}&itemName=${itemName}`;
    }
    if (clientIds) {
      params = `${params}&clientIds=${clientIds}`;
    }
    if (itemFamilyIds) {
      params = `${params}&itemFamilyIds=${itemFamilyIds}`;
    }
    if (inventoryQuantityChangeTypes) {
      params = `${params}&inventoryQuantityChangeTypes=${inventoryQuantityChangeTypes}`;
    }
    if (username) {
      params = `${params}&username=${username}`;
    }
    if (roleName) {
      params = `${params}&roleName=${roleName}`;
    }
    if (enabled) {
      params = `${params}&enabled=${enabled}`;
    }

    const url = `inventory/inventory-adjustment-thresholds?${params}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  getInventoryAdjustmentThresholdById(id: number): Observable<InventoryAdjustmentThreshold> {
    const url = `inventory/inventory-adjustment-thresholds/${id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  addInventoryAdjustmentThreshold(
    inventoryAdjustmentThreshold: InventoryAdjustmentThreshold,
  ): Observable<InventoryAdjustmentThreshold> {
    const url = `inventory/inventory-adjustment-thresholds`;
    return this.http.put(url, inventoryAdjustmentThreshold).pipe(map(res => res.data));
  }

  changeInventoryAdjustmentThreshold(
    id: number,
    inventoryAdjustmentThreshold: InventoryAdjustmentThreshold,
  ): Observable<InventoryAdjustmentThreshold> {
    const url = `inventory/inventory-adjustment-thresholds/${id}`;
    return this.http.post(url, inventoryAdjustmentThreshold).pipe(map(res => res.data));
  }
  removeInventoryAdjustmentThreshold(id: number): Observable<InventoryAdjustmentThreshold> {
    const url = `inventory/inventory-adjustment-thresholds/${id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
