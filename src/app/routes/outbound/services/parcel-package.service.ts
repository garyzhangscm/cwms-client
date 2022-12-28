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
}
