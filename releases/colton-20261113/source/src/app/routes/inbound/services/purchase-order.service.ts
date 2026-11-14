import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PurchaseOrder } from '../models/purchase-order';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,  
    private utilService: UtilService
  ) { }

  getPurchaseOrders(number?: string,  statusList?: string, 
    supplierName?: string, loadDetails?: boolean,): Observable<PurchaseOrder[]> {
     
    
    let params = new HttpParams();

    const url = `inbound/purchase-orders`;
    params = params.append("warehouseId", this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append("number", this.utilService.encodeHttpParameter(number.trim())); 
    }
    if (loadDetails !== undefined && loadDetails!= null) {
      params = params.append("loadDetails",loadDetails); 
    }
    if (statusList) {
      params = params.append("purchasOrderStatusList", statusList); 
    }
    if (supplierName) {
      params = params.append("supplierName", this.utilService.encodeHttpParameter(supplierName.trim())); 
    }
 

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getPurchaseOrder(id: number): Observable<PurchaseOrder> {
    return this.http.get(`inbound/purchase-orders/${id}`).pipe(map(res => res.data));
  }

  
  createReceipt(id: number, receiptNumber: String, allowUnexpectedItem: boolean, 
    receiptQuantities :Array<{ purchaseOrderLineId: number; quantity: number }>): Observable<PurchaseOrder> {
      
    let url = `inbound/purchase-orders/${id}/create-receipt?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    url = `${url}&receiptNumber=${receiptNumber}`;
    url = `${url}&allowUnexpectedItem=${allowUnexpectedItem}`; 

    console.log(`create receipt with quantities ${JSON.stringify(receiptQuantities)}`)

    return this.http.post(url, receiptQuantities).pipe(map(res => res.data));
  }


}
