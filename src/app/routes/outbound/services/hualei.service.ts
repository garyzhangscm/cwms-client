import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { HualeiProduct } from '../models/hualei-product';
import { HualeiShipmentResponse } from '../models/hualei-shipment-response';

@Injectable({
  providedIn: 'root'
})
export class HualeiService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  sendHualeiRequest(productId : string, 
    orderId: number, length: number, width: number, height: number, 
    weight: number): Observable<HualeiShipmentResponse[]> {
    let url = `outbound/hualei/shipping`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    if (productId) {
      params = params.append('productId', productId.trim());  
    }
    if (orderId) {
      params = params.append('orderId', orderId);  
    }
    if (length) {
      params = params.append('length', length);  
    }
    if (width) {
      params = params.append('width', width);  
    }
    if (height) {
      params = params.append('height', height);  
    }
    if (weight) {
      params = params.append('weight', weight);  
    }

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }

  
}
