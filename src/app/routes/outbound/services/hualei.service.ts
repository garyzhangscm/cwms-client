import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { HualeiProduct } from '../models/hualei-product';
import { HualeiShipmentRequest } from '../models/hualei-shipment-request';
import { HualeiShipmentResponse } from '../models/hualei-shipment-response';

@Injectable({
  providedIn: 'root'
})
export class HualeiService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  sendHualeiRequest(productId : string, 
    orderId: number, length: number, width: number, height: number, 
    weight: number, packageCount?: number, itemName?: string,
    quantity?: number, unitCost?: number): Observable<HualeiShipmentRequest[]> {
    let url = `outbound/hualei/shipping`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    if (productId) {
      params = params.append('productId', productId.trim());  
    }
    if (orderId != null) {
      params = params.append('orderId', orderId);  
    }
    if (length != null) {
      params = params.append('length', length);  
    }
    if (width != null) {
      params = params.append('width', width);  
    }
    if (height != null) {
      params = params.append('height', height);  
    }
    if (weight != null) {
      params = params.append('weight', weight);  
    }
    if (packageCount != null) {
      params = params.append('packageCount', packageCount);  
    }
    else {
      
      params = params.append('packageCount', 1);  
    }
    if (itemName != null) {
      params = params.append('itemName', itemName.trim());  
    }
    if (quantity != null) {
      params = params.append('quantity', quantity);  
    }
    if (unitCost != null) {
      params = params.append('unitCost', unitCost);  
    }

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }

  getHualeiShippingLabel( 
    orderId: number,  productId : string,
    hualeiOrderId: string): Observable<HualeiShipmentResponse[]> {
    let url = `outbound/hualei/shipping/label`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('orderId', orderId);  
    params = params.append('productId', productId.trim());  
    params = params.append('hualeiOrderId', hualeiOrderId);  
     

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  
}
