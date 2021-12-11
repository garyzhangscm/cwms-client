import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ItemSampling } from '../models/item-sampling';

@Injectable({
  providedIn: 'root'
})
export class ItemSamplingService {
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
  ) { }

  getItemSamplings(number?: string, itemName?: string, itemId?: number): Observable<ItemSampling[]> {
    
    let url = `inventory/item-sampling?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    
    if (itemName) {
      url = `${url}&itemName=${httpUrlEncodingCodec.encodeValue(itemName.trim())}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  getItemSampling(id: number): Observable<ItemSampling> {
    
    let url = `inventory/item-sampling/${id}`;
     
    return this.http.get(url).pipe(map(res => res.data));
  }

  addItemSampling(itemSampling: ItemSampling): Observable<ItemSampling[]> {
    
    let url = `inventory/item-sampling?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.put(url, itemSampling).pipe(map(res => res.data));
  }

  
  removeItemSampling(itemSamplingId: number): Observable<ItemSampling[]> {
    
    let url = `inventory/item-sampling/${itemSamplingId}`;
    
    
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
