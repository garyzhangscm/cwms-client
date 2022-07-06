import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CustomerReturnOrderLine } from '../models/customer-return-order-line';

@Injectable({
  providedIn: 'root'
})
export class CustomerReturnOrderLineService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService) {}

  getNextCustomerReturnOrderLineNumber(customerReturnOrderId: number): Observable<string> {
    return this.http.get(`inbound/customer-return-orders/${customerReturnOrderId}/next-line-number`).pipe(map(res => res.data));
  }
  getCustomerReturnOrderLine(customerReturnOrderLineId: number): Observable<CustomerReturnOrderLine> {
    return this.http.get(`inbound/customer-return-orders/lines/${customerReturnOrderLineId}`).pipe(map(res => res.data));
  }

  createCustomerReturnOrderLine(customerReturnOrderId: number, customerReturnOrderLine: CustomerReturnOrderLine): Observable<CustomerReturnOrderLine> {
    return this.http.post(`inbound/customer-return-orders/${customerReturnOrderId}/lines`, customerReturnOrderLine).pipe(map(res => res.data));
  }

  receiveInventory(customerReturnOrderId: number, customerReturnOrderLineId: number, inventory: Inventory): Observable<Inventory> {
    return this.http
      .post(`inbound/customer-return-orders/${customerReturnOrderId}/lines/${customerReturnOrderLineId}/receive`, inventory)
      .pipe(map(res => res.data));
  }

  removeCustomerReturnOrderLine(customerReturnOrderId: number, customerReturnOrderLine: CustomerReturnOrderLine): Observable<CustomerReturnOrderLine> {
    const url = `inbound/customer-return-orders/${customerReturnOrderId}/lines/${customerReturnOrderLine.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 

  
  generatePrePrintLPNLabel(customerReturnOrderLineId: number, lpn: string, quantity?: number, printerName?: string) : Observable<ReportHistory> {
    
    let url = `inbound/customer-return-orders/lines/${customerReturnOrderLineId}/pre-print-lpn-label?lpn=${lpn}`;
    
    if (quantity) {
      url = `${url}&quantity=${quantity}`
    }
    if (printerName) {
      url = `${url}&printerName=${printerName}`
    }
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }

  
  generatePrePrintLPNLabelInBatch(customerReturnOrderLineId: number, lpn: string, quantity?: number, count?: number, 
    copies?: number, printerName?: string) : Observable<ReportHistory> {
    
    let url = `inbound/customer-return-orders/lines/${customerReturnOrderLineId}/pre-print-lpn-label/batch?lpn=${lpn}`;
    
    if (count) {
      url = `${url}&count=${count}`
    }
    else {      
      url = `${url}&count=1`
    }

    if (quantity  && quantity > 0) {
      url = `${url}&quantity=${quantity}`
    }
    if (copies) {
      url = `${url}&copies=${copies}`
    }
    if (printerName) {
      url = `${url}&printerName=${printerName}`
    }
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }

  recalculateQCQuantity(customerReturnOrderLine: CustomerReturnOrderLine, qcQuantity?: number, qcPercentage?: number) :  Observable<CustomerReturnOrderLine> {
     
    let url = `inbound/customer-return-orders/lines/${customerReturnOrderLine.id}/recalculate-qc-quantity?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    if (qcQuantity != null) {
      url = `${url}&qcQuantity=${qcQuantity}`
    }
    if (qcPercentage != null) {
      url = `${url}&qcPercentage=${qcPercentage}`
    }
     

    return this.http.post(url).pipe(map(res => res.data));
  }
 
}
