import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ParcelPackage } from '../models/parcel-package';

@Injectable({
  providedIn: 'root'
})
export class ParcelPackageService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  
  getAll(
    orderId?: number, 
    orderNumber?: string,
  ): Observable<ParcelPackage[]> {
    let url = `outbound/parcel/packages?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (orderId) {
      url = `${url}&orderId=${orderId}`;
    } 
    if (orderNumber) {
      url = `${url}&orderNumber=${orderNumber}`;
    } 
    return this.http.get(url).pipe(map(res => res.data));
  }

  addParcelPackage(orderId: number, parcelPackage: ParcelPackage) : Observable<ParcelPackage> {
    const url = `outbound/parcel/packages`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    params = params.append('orderId', orderId);  
 
    return this.http.put(url, parcelPackage, params).pipe(map(res => res.data));
  }
  remove(id: number) : Observable<String> {
    let url = `outbound/parcel/packages/${id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
