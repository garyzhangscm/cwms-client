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
    const url = `inventory/inventories?location=${location}&warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  getInventoriesByLocationId(locationId: number): Observable<Inventory[]> {
    const url = `inventory/inventories?locationId=${locationId}&warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  getInventoriesByLpn(lpn: string): Observable<Inventory[]> {
    const url = `inventory/inventories?lpn=${lpn}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
  removeInventory(inventory: Inventory): Observable<Inventory> {
    const url = 'inventory/inventory/' + inventory.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  adjustDownInventory(inventory: Inventory, documentNumber?: string, comment?: string): Observable<Inventory> {
    let url = `inventory/inventory-adj/${inventory.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (documentNumber) {
      url = `${url}&documentNumber=${documentNumber}`;
    }
    if (comment) {
      url = `${url}&comment=${comment}`;
    }
    return this.http.delete(url).pipe(map(res => res.data));
  }
  changeInventory(inventory: Inventory): Observable<Inventory> {
    const url = `inventory/inventory/${inventory.id}`;
    return this.http.put(url, inventory).pipe(map(res => res.data));
  }

  adjustInventoryQuantity(inventory: Inventory, documentNumber?: string, comment?: string): Observable<Inventory> {
    let url = `inventory/inventory/${inventory.id}/adjust-quantity?newQuantity=${inventory.quantity}`;
    if (documentNumber) {
      url = `${url}&documentNumber=${documentNumber}`;
    }
    if (comment) {
      url = `${url}&comment=${comment}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }

  getNextLPN(): Observable<string> {
    return this.systemControlledNumberService.getNextAvailableId('LPN');
  }
  move(inventory: Inventory, destination: WarehouseLocation, immediateMove: boolean = true): Observable<Inventory> {
    const url = `inventory/inventory/${inventory.id}/move?immediateMove=${immediateMove}`;
    return this.http.post(url, destination).pipe(map(res => res.data));
  }

  addInventory(inventory: Inventory, documentNumber?: string, comment?: string): Observable<Inventory> {
    let url = `inventory/inventory-adj?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (documentNumber) {
      url = `${url}&documentNumber=${documentNumber}`;
    }
    if (comment) {
      url = `${url}&comment=${comment}`;
    }
    return this.http.put(url, inventory).pipe(map(res => res.data));
  }

  unpick(inventory: Inventory, destinationLocationName?: string, immediateMove?: boolean): Observable<Inventory> {
    let url = `inventory/inventory/${inventory.id}/unpick?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }`;
    if (destinationLocationName) {
      url = url + `&destinationLocationName=${destinationLocationName}`;
    }
    if (immediateMove) {
      url = url + `&immediateMove=${immediateMove}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }

  reverseReceivedInventory(inventory: Inventory) {
    const url = `inventory/inventory/${inventory.id}/reverse-receiving`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
