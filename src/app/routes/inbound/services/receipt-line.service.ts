import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Inventory } from '../../inventory/models/inventory';
import { ReceiptLine } from '../models/receipt-line';

@Injectable({
  providedIn: 'root',
})
export class ReceiptLineService {
  constructor(private http: _HttpClient) {}

  getNextReceiptLineNumber(receiptId: number): Observable<string> {
    return this.http.get(`inbound/receipts/${receiptId}/next-line-number`).pipe(map(res => res.data));
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
}
