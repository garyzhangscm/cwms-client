import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client } from '../../common/models/client';
import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageService,
    private warehouseService: WarehouseService,
  ) {}

  getItems(name?: string, clients?: Client[], itemFamilies?: ItemFamily[]): Observable<Item[]> {
    let url = `inventory/items?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (name) {
      url = `${url}&name=${name}`;
    }
    if (clients && clients.length > 0) {
      url = `${url}&clientIds=${clients.join(',')}`;
    }
    if (itemFamilies && itemFamilies.length > 0) {
      url = `${url}&itemFamilyIds=${itemFamilies.join(',')}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
  getItem(itemId: number): Observable<Item> {
    return this.http.get(`inventory/items/${itemId}`).pipe(map(res => res.data));
  }

  addItem(item: Item): Observable<Item> {
    return this.http.post('inventory/items', item).pipe(map(res => res.data));
  }

  changeItem(item: Item): Observable<Item> {
    const url = 'inventory/items/' + item.id;
    return this.http.put(url, item).pipe(map(res => res.data));
  }

  removeItem(item: Item): Observable<Item> {
    const url = 'inventory/items/' + item.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeItems(items: Item[]): Observable<Item[]> {
    const itemIds: number[] = [];
    items.forEach(item => {
      itemIds.push(item.id!);
    });
    const params = {
      item_ids: itemIds.join(','),
    };
    return this.http.delete('inventory/items', params).pipe(map(res => res.data));
  }
}
