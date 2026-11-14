import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { ItemBarcode } from '../models/item-barcode';


@Injectable({
  providedIn: 'root',
})
export class ItemBarcodeService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService, 
  ) {}

  getItemBarcodes(itemId?: number, itemName?: string): Observable<ItemBarcode[]> {
    
    const url = `inventory/item-barcodes`;

    let params = new HttpParams(); 
     
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id);
    if (itemId != null) {
        params = params.append("itemId", itemId);
    }
    if (itemName) {
        params = params.append("itemName", itemName);
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getItemBarcode(id: number): Observable<ItemBarcode> { 

    const url = `inventory/item-barcodes/${id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }


  changeItemBarcode(itemBarcode: ItemBarcode): Observable<ItemBarcode> {
    const url = `inventory/item-barcodes/${  itemBarcode.id}`;
    return this.http.put(url, itemBarcode).pipe(map(res => res.data));
  }

  removeItemBarcode(itemBarcodeId: number): Observable<ItemBarcode> {
    const url = `inventory/item-barcodes/${itemBarcodeId}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 
}
