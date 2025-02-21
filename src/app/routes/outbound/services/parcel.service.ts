import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { EasyPostRate } from '../models/easy-post-rate';
import { EasyPostShipment } from '../models/easy-post-shipment';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  
  createEasyPostShipment(orderId: number, 
    length: number, 
    width: number,
    height: number,
    weight: number, ): Observable<EasyPostShipment> {
     
     
    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);
    params = params.append('orderId', orderId);
    params = params.append('length', length);
    params = params.append('width', width);
    params = params.append('height', height);
    params = params.append('weight', weight); 
    
    return this.http.post(`outbound/parcel/easy-post/shipment`, null, params).pipe(map(res => res.data));
  }

  confirmEasyPostShipment(orderId: number, shipmentId: string,
    rate: EasyPostRate): Observable<EasyPostShipment> {
     
     
    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);
    params = params.append('shipmentId', shipmentId); 
    params = params.append('orderId', orderId); 
    
    return this.http.post(`outbound/parcel/easy-post/shipment-confirm`, rate, params).pipe(map(res => res.data));
  }
}
