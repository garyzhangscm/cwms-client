import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client } from '../../common/models/client';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Item } from '../models/item';
import { ItemBarcode } from '../models/item-barcode';
import { ItemFamily } from '../models/item-family';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(
    private http: _HttpClient,
    private utilService: UtilService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}

  getItemsByIdList(itemIdList: string, loadDetails?: boolean): Observable<Item[]> {
    let url = `inventory/items?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&itemIdList=${itemIdList}`;
    
    if (loadDetails === undefined) {
      url = `${url}&loadDetails=true`
    }
    else {      
      url = `${url}&loadDetails=${loadDetails}`
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  getItems(name?: string, 
    clients?: Client[], 
    itemFamilies?: ItemFamily[], 
    companyItem?: boolean, 
    warehouseSpecificItem?: boolean, 
    clientIds?: string, description?: string, 
    barcode?: string): Observable<Item[]> { 
    let params = new HttpParams(); 

    const url = `inventory/items`;

    params = params.append("companyId", this.companyService.getCurrentCompany()!.id);
     
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);

    if (name) { 
      params = params.append("name", this.utilService.encodeHttpParameter(name.trim()));
    }
    if (barcode) { 
      params = params.append("barcode", this.utilService.encodeHttpParameter(barcode.trim()));
    }
    if (description) {
      params = params.append("description", this.utilService.encodeHttpParameter(description.trim())); 
    }
    if (clients && clients.length > 0) { 
      params = params.append("clientIds",clients.join(',') );
    }
    else if(clientIds) {       
      params = params.append("clientIds", clientIds);
    }
    if (itemFamilies && itemFamilies.length > 0) { 
      params = params.append("itemFamilyIds", itemFamilies.join(','));
    }
    if (companyItem != null) { 
      params = params.append("globalItem", companyItem);
    }
    if (warehouseSpecificItem != null) { 
      params = params.append("warehouseSpecificItem", warehouseSpecificItem);
    }

    console.log(`start to get item by url\n ${url}`);
    
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  getItem(itemId: number): Observable<Item> {
    return this.http.get(`inventory/items/${itemId}`).pipe(map(res => res.data));
  }

  addItem(item: Item): Observable<Item> {
    return this.http.post('inventory/items', item).pipe(map(res => res.data));
  }

  changeItem(item: Item): Observable<Item> {
    const url = `inventory/items/${  item.id}`;
    return this.http.put(url, item).pipe(map(res => res.data));
  }

  removeItem(item: Item): Observable<Item> {
    const url = `inventory/items/${  item.id}`;
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

  processItemOverride(itemId?: number): Observable<string> {
    
    let params = new HttpParams();
    const url = `inventory/items/process-item-override`;
    if (itemId != null) {

      params = params.append("itemId", itemId);
    }
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);
    return this.http.post(url, null, params).pipe(map(res => res.data));
  }

  
  addItemBarcode(itemId: number, itemBarcode: ItemBarcode): Observable<ItemBarcode> {
    let params = new HttpParams();
    const url = `inventory/items/${itemId}/add-item-barcode`; 
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);

    return this.http.post(url, itemBarcode, params).pipe(map(res => res.data));
  }
  
  findItemByBarcode(barcode: string): Observable<Item[]> {
    let params = new HttpParams();
    const url = `inventory/items-query/by-barcode`; 
    params = params.append("companyId", this.companyService.getCurrentCompany()!.id);
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);
    params = params.append("barcode", barcode);

    return this.http.get(url, params).pipe(map(res => res.data));
  }
}
