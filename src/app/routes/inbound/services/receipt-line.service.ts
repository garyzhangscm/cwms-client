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
    return this.http.put(`inbound/receipts/${receiptId}/lines`, receiptLine).pipe(map(res => res.data));
  }
  
  changeReceiptLine(receiptId: number, receiptLine: ReceiptLine): Observable<ReceiptLine> {
    return this.http.post(`inbound/receipts/${receiptId}/lines/${receiptLine.id!}`, receiptLine).pipe(map(res => res.data));
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

  
  generatePrePrintLPNLabel(receiptLineId: number, lpn: string, quantity?: number, printerName?: string) : Observable<ReportHistory> {
    
    let url = `inbound/receipts/receipt-lines/${receiptLineId}/pre-print-lpn-label?lpn=${lpn}`;
    
    if (quantity) {
      url = `${url}&quantity=${quantity}`
    }
    if (printerName) {
      url = `${url}&printerName=${printerName}`
    }
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }

  
  generatePrePrintLPNLabelInBatch(receiptLineId: number, lpn: string, inventoryQuantity?: number, count?: number, 
    copies?: number, printerName?: string, ignoreInventoryQuantity?: boolean) : Observable<ReportHistory> {
    
    const url = `inbound/receipts/receipt-lines/${receiptLineId}/pre-print-lpn-label/batch`;

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append('lpn', lpn); 

    
    if (count) { 
      params = params.append('count', count); 
    }
    else {       
      params = params.append('count', 1); 
    }

    if (inventoryQuantity  && inventoryQuantity > 0) { 
      params = params.append('inventoryQuantity', inventoryQuantity); 
    }
    if (copies) { 
      params = params.append('copies', copies); 
    }
    if (printerName) { 
      params = params.append('printerName', printerName); 
    }
    if (ignoreInventoryQuantity != null) {
      params = params.append('ignoreInventoryQuantity', ignoreInventoryQuantity); 

    }
    
    
    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  generatePrePrintLPNReportInBatch(receiptLineId: number, lpn: string, quantity?: number, count?: number, 
    copies?: number, printerName?: string) : Observable<ReportHistory> {
    
    let url = `inbound/receipts/receipt-lines/${receiptLineId}/pre-print-lpn-report/batch?lpn=${lpn}`;
    
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

  recalculateQCQuantity(receiptLine: ReceiptLine, qcQuantity?: number, qcPercentage?: number) :  Observable<ReceiptLine> {
     
    let url = `inbound/receipts/lines/${receiptLine.id}/recalculate-qc-quantity?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    if (qcQuantity != null) {
      url = `${url}&qcQuantity=${qcQuantity}`
    }
    if (qcPercentage != null) {
      url = `${url}&qcPercentage=${qcPercentage}`
    }
     

    return this.http.post(url).pipe(map(res => res.data));
  }

  
  getAvailableReceiptLinesForMPS(itemId: number) : Observable<ReceiptLine[]>{
    let url = `inbound/receipts/lines/available-for-mps?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&itemId=${itemId}`;
  
    
    return this.http.get(url).pipe(map(res => res.data));
  }
}
