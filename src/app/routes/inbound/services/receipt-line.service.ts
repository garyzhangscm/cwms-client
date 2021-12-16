import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ReceiptLine } from '../models/receipt-line';

@Injectable({
  providedIn: 'root',
})
export class ReceiptLineService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService) {}

  getNextReceiptLineNumber(receiptId: number): Observable<string> {
    return this.http.get(`inbound/receipts/${receiptId}/next-line-number`).pipe(map(res => res.data));
  }
  getReceiptLine(receiptLineId: number): Observable<ReceiptLine> {
    return this.http.get(`inbound/receipts/receipt-lines/${receiptLineId}`).pipe(map(res => res.data));
  }

  createReceiptLine(receiptId: number, receiptLine: ReceiptLine): Observable<ReceiptLine> {
    return this.http.post(`inbound/receipts/${receiptId}/lines`, receiptLine).pipe(map(res => res.data));
  }

  receiveInventory(receiptId: number, receiptLineId: number, inventory: Inventory): Observable<Inventory> {
    return this.http
      .post(`inbound/receipts/${receiptId}/lines/${receiptLineId}/receive`, inventory)
      .pipe(map(res => res.data));
  }

  removeReceiptLine(receiptId: number, receiptLine: ReceiptLine): Observable<ReceiptLine> {
    const url = `inbound/receipts/${receiptId}/lines/${receiptLine.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeReceiptLines(receiptLines: ReceiptLine[]): Observable<ReceiptLine[]> {
    const receiptLineIds: number[] = [];
    receiptLines.forEach(receiptLine => {
      receiptLineIds.push(receiptLine.id!);
    });
    const params = {
      receiptLineIds: receiptLineIds.join(','),
    };
    return this.http.delete(`inbound/receipts/lines`, params).pipe(map(res => res.data));
  }

  
  generatePrePrintLPNLabel(receiptLineId: number, lpn: string, quantity?: number) : Observable<ReportHistory> {
    
    let url = `inbound/receipts/receipt-lines/${receiptLineId}/pre-print-lpn-label?lpn=${lpn}`;
    
    if (quantity) {
      url = `${url}&quantity=${quantity}`
    }
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }

  
  generatePrePrintLPNLabelInBatch(receiptLineId: number, lpn: string, quantity?: number, count?: number, 
    copies?: number) : Observable<ReportHistory> {
    
    let url = `inbound/receipts/receipt-lines/${receiptLineId}/pre-print-lpn-label/batch?lpn=${lpn}`;
    
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
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }

  recalculateQCQuantity(receiptLine: ReceiptLine, qcQuantity?: number, qcPercentage?: number) :  Observable<ReceiptLine> {
     
    let url = `inbound/receipts/lines/${receiptLine.id}/recalculate-qc-quantity?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    if (qcQuantity) {
      url = `${url}&qcQuantity=${qcQuantity}`
    }
    if (qcPercentage) {
      url = `${url}&qcPercentage=${qcPercentage}`
    }
     

    return this.http.post(url).pipe(map(res => res.data));
  }

}
