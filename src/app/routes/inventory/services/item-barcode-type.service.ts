import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { ItemBarcodeType } from '../models/item-barcode-type';

@Injectable({
  providedIn: 'root',
})
export class ItemBarcodeTypeService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService, 
  ) {}

  getItemBarcodeTypes(name?: string): Observable<ItemBarcodeType[]> {
    
    const url = `inventory/item-barcode-types`;

    let params = new HttpParams(); 
     
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);
    if (name) {
        params = params.append("name", name);
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getItemBarcodeType(id: number): Observable<ItemBarcodeType> { 

    const url = `inventory/item-barcode-types/${id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  addItemBarcodeType(itemBarcodeType: ItemBarcodeType): Observable<ItemBarcodeType> {
    return this.http.post('inventory/item-barcode-types', itemBarcodeType).pipe(map(res => res.data));
  }

  changeItemBarcodeType(itemBarcodeType: ItemBarcodeType): Observable<ItemBarcodeType> {
    const url = `inventory/item-barcode-types/${  itemBarcodeType.id}`;
    return this.http.put(url, itemBarcodeType).pipe(map(res => res.data));
  }

  removeItemBarcodeType(itemBarcodeTypeId: number): Observable<ItemBarcodeType> {
    const url = `inventory/item-barcode-types/${itemBarcodeTypeId}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 
}
