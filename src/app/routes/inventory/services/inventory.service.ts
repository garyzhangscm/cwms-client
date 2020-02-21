import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Observable } from 'rxjs';
import { Inventory } from '../models/inventory';
import { map } from 'rxjs/operators';
import { Client } from '../../common/models/client';
import { ItemFamily } from '../models/item-family';
import { SystemControlledNumberService } from '../../common/services/system-controlled-number.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private systemControlledNumberService: SystemControlledNumberService,
  ) {}

  getInventories(
    clients?: Client[],
    itemFamilies?: ItemFamily[],
    itemName?: string,
    location?: string,
    lpn?: string,
  ): Observable<Inventory[]> {
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
    params = `${params}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = 'inventory/inventories' + (params.length > 0 ? '?' + params : '');
    return this.http.get(url).pipe(map(res => res.data));
  }

  getInventoryById(id: number): Observable<Inventory> {
    const url = `inventory/inventory/${id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  getInventoriesByLocationName(location: string): Observable<Inventory[]> {
    const url = `inventory/inventories?location=${location}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  getInventoriesByLocationIds(locationIds: number[]): Observable<Inventory[]> {
    const url = `inventory/inventories?locationIds=${locationIds.join(',')}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  getInventoriesByLpn(lpn: string): Observable<Inventory[]> {
    const url = `inventory/inventories?lpn=${lpn}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  removeInventory(inventory: Inventory): Observable<Inventory> {
    const url = 'inventory/inventory/' + inventory.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  adjustDownInventory(inventory: Inventory): Observable<Inventory> {
    const url = `inventory/inventory-adj/${inventory.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  changeInventory(inventory: Inventory): Observable<Inventory> {
    const url = `inventory/inventory/${inventory.id}`;
    return this.http.put(url, inventory).pipe(map(res => res.data));
  }

  getNextLPN(): Observable<string> {
    return this.systemControlledNumberService.getNextAvailableId('LPN');
  }
  move(inventory: Inventory, destination: WarehouseLocation): Observable<Inventory> {
    const url = `inventory/inventory/${inventory.id}/move`;
    return this.http.post(url, destination).pipe(map(res => res.data));
  }
}
