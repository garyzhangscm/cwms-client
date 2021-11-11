import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client } from '../../common/models/client'; 
import { ReportHistory } from '../../report/models/report-history';
import { SystemControlledNumberService } from '../../util/services/system-controlled-number.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Inventory } from '../models/inventory';
import { ItemFamily } from '../models/item-family';

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
    locationName?: string,
    lpn?: string,
    includeDetails?: boolean,
    inventoryStatusId?: number,
    locationGroupId?: number
  ): Observable<Inventory[]> {
    let params = `warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (itemName) {
      params = `${params}&itemName=${itemName}`;
    }
    if (clients && clients.length > 0) {
      params = `${params}&clients=${clients.join(',')}`;
    }
    if (itemFamilies && itemFamilies.length > 0) {
      params = `${params}&item_families=${itemFamilies.join(',')}`;
    }
    if (locationName) {
      params = `${params}&location=${locationName}`;
    }
    if (lpn) {
      params = `${params}&lpn=${lpn}`;
    } 
    if (locationGroupId) {
      params = `${params}&locationGroupId=${locationGroupId}`;
    } 
    if (inventoryStatusId) {
      params = `${params}&inventoryStatusId=${inventoryStatusId}`;
    } 
    if (includeDetails !== undefined && includeDetails !== null) {

      params = `${params}&includeDetails=${includeDetails}`;
    }

    const url = `inventory/inventories${  params.length > 0 ? `?${  params}` : ''}`;
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
  getInventoriesByLocationNameAndItemNameAndInventoryStatusId(
    locationId: number,
    itemName: string,
    inventoryStatusId: number
  ): Observable<Inventory[]> {
    const url = `inventory/inventories?inventoryStatusId=${inventoryStatusId}&locationId=${locationId}&itemName=${itemName}&warehouseId=${
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
    const url = `inventory/inventory/${  inventory.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  
  removeInventories(inventoryIds: string): Observable<Inventory> {
    const url = `inventory/inventory?inventoryIds=${inventoryIds}`;
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
      url = `${url}&destinationLocationName=${destinationLocationName}`;
    }
    if (immediateMove) {
      url = `${url}&immediateMove=${immediateMove}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }

  reverseReceivedInventory(inventory: Inventory) {
    const url = `inventory/inventory/${inventory.id}/reverse-receiving`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  
  generateEcotechLPNLabel(lpn: string) : Observable<ReportHistory>{
    const url = `inventory/inventories/${this.warehouseService.getCurrentWarehouse().id}/${lpn}/lpn-label/ecotech`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
