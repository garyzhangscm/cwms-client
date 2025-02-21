 
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ItemSampling } from '../models/item-sampling';

@Injectable({
  providedIn: 'root'
})
export class ItemSamplingService {
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private utilService: UtilService
  ) { }

  getItemSamplings(number?: string, itemName?: string, itemId?: number, enabled?: boolean, currentSampleOnly?: boolean): Observable<ItemSampling[]> {
    
    let url = `inventory/item-sampling?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
     
    
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    
    if (itemName) {
      url = `${url}&itemName=${this.utilService.encodeValue(itemName.trim())}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (enabled != undefined && enabled != null) {
      url = `${url}&enabled=${enabled}`;
    }
    if (currentSampleOnly != undefined && currentSampleOnly != null) {
      url = `${url}&currentSampleOnly=${currentSampleOnly}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  
  getItemSamplingsForDisplay(number?: string, itemName?: string, itemId?: number, enabled?: boolean, currentSampleOnly?: boolean): Observable<ItemSampling[]> {
    
    let url = `inventory/item-sampling/display?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`; 
    
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    
    if (itemName) {
      url = `${url}&itemName=${this.utilService.encodeValue(itemName.trim())}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    
    if (enabled != undefined && enabled != null) {
      url = `${url}&enabled=${enabled}`;
    }
    if (currentSampleOnly != undefined && currentSampleOnly != null) {
      url = `${url}&currentSampleOnly=${currentSampleOnly}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  getItemSampling(id: number): Observable<ItemSampling> {
    
    let url = `inventory/item-sampling/${id}`;
     
    return this.http.get(url).pipe(map(res => res.data));
  }
  

  addItemSampling(itemSampling: ItemSampling): Observable<ItemSampling> {
    
    let url = `inventory/item-sampling?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.put(url, itemSampling).pipe(map(res => res.data));
  }

  changeItemSampling(itemSampling: ItemSampling): Observable<ItemSampling> {
    
    let url = `inventory/item-sampling/${itemSampling.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.post(url, itemSampling).pipe(map(res => res.data));
  }
  
  removeItemSampling(itemSamplingId: number): Observable<ItemSampling> {
    
    let url = `inventory/item-sampling/${itemSamplingId}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.delete(url).pipe(map(res => res.data));
  }

  disableItemSampling(itemSampling: ItemSampling): Observable<ItemSampling> {
    
    let url = `inventory/item-sampling/${itemSampling.id}/disable?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }

  removeItemSamplingImageByItemId(itemId: number, fileName: string): Observable<string> {
    
    let url = `inventory/item-sampling/images/${this.warehouseService.getCurrentWarehouse().id}/${itemId}/${fileName}`;
    
    
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeItemSamplingImageByItemIdAndNumber(itemId: number, number: string, fileName: string): Observable<string> {
    
    let url = `inventory/item-sampling/images/${this.warehouseService.getCurrentWarehouse().id}/${itemId}/${number}/${fileName}`;
    
    
    return this.http.delete(url).pipe(map(res => res.data));
  }
  
  getPreviousItemSamplingForDisplay(itemName?: string, itemId?: number): Observable<ItemSampling[]> {
     
     
    let url = `inventory/item-sampling/previous/display?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (itemName) {
      url = `${url}&itemName=${this.utilService.encodeValue(itemName.trim())}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    
    return this.http.get(url).pipe(map(res => res.data));
  }
}
