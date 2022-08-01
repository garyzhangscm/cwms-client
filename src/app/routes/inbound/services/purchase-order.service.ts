import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PurchaseOrder } from '../models/purchase-order';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,  
  ) { }

  getPurchaseOrders(number?: string,  statusList?: string, 
    supplierName?: string, loadDetails?: boolean,): Observable<PurchaseOrder[]> {
    let url = `inbound/purchase-orders?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    

    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    if (loadDetails !== undefined && loadDetails!= null) {
      url = `${url}&loadDetails=${loadDetails}`;
    }
    if (statusList) {
      url = `${url}&receipt_status_list=${statusList}`;
    }
    if (supplierName) {
      url = `${url}&supplierName=${supplierName}`;
    }
 

    return this.http.get(url).pipe(map(res => res.data));
  }

  getReceipt(id: number): Observable<PurchaseOrder> {
    return this.http.get(`inbound/purchase-orders/${id}`).pipe(map(res => res.data));
  }

  
  createReceipt(id: number, receiptNumber: String, allowUnexpectedItem: boolean, receiptQuantityMap : Map<number, number>): Observable<PurchaseOrder> {
      
    let url = `inbound/purchase-orders/${id}/create-receipt?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    url = `${url}&receiptNumber=${receiptNumber}`;
    url = `${url}&allowUnexpectedItem=${allowUnexpectedItem}`; 

    return this.http.post(url, receiptQuantityMap).pipe(map(res => res.data));
  }

}
