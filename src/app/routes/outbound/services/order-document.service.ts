import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OrderDocument } from '../models/order-document';

@Injectable({
  providedIn: 'root'
})
export class OrderDocumentService {
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,  
  ) { }

  getOrderDocuments(orderId?: number, orderNumber?: string, fileName?: string,): Observable<OrderDocument[]> {
    let url = `outbound/orders/documents?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec();
    if (orderId) {
      
      url = `${url}&orderId=${orderId}`; 
    }
    if (orderNumber) {
      
      url = `${url}&orderNumber=${httpUrlEncodingCodec.encodeValue(orderNumber)}`; 
    }
    if (fileName) {
      
      url = `${url}&fileName=${httpUrlEncodingCodec.encodeValue(fileName)}`; 
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getOrderDocument(id: number): Observable<OrderDocument> {
    return this.http.get(`outbound/orders/documents/${id}`).pipe(map(res => res.data));
  }

  saveOrderDocument(orderId: number, orderDocuments : OrderDocument[]): Observable<OrderDocument[]> {
    const url = `outbound/orders/${orderId}/documents?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.post(url, orderDocuments).pipe(map(res => res.data));
  }
  removeOrderDocument(id: number): Observable<string> {
    return this.http.delete(`outbound/orders/documents/${id}`).pipe(map(res => res.data));
  }

}
