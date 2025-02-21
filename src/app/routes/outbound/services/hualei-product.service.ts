import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { HualeiProduct } from '../models/hualei-product';

@Injectable({
  providedIn: 'root'
})
export class HualeiProductService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getHualeiProducts(productId? : string, 
    name?: string, description?: string): Observable<HualeiProduct[]> {
    let url = `outbound/hualei-products`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    if (productId) {
      params = params.append('productId', productId.trim());  
    }
    if (name) {
      params = params.append('name', name.trim());  
    }
    if (description) {
      params = params.append('description', description.trim());  
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getHualeiProduct(id: number): Observable<HualeiProduct> {
    return this.http.get(`outbound/hualei-products/${id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`).pipe(map(res => res.data));
  } 
 
  addHualeiProduct(hualeiProduct: HualeiProduct): Observable<HualeiProduct> {
    return this.http.put(`outbound/hualei-products?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, hualeiProduct).pipe(map(res => res.data));
  } 

  removeHualeiProduct(hualeiProduct: HualeiProduct): Observable<HualeiProduct> {
    const url = `outbound/hualei-products/${hualeiProduct.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
