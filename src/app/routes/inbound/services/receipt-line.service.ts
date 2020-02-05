import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReceiptLine } from '../models/receipt-line';
import { Inventory } from '../../inventory/models/inventory';

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
      .post(`inbound/receipts/${receiptId}/line/${receiptLineId}/receive`, inventory)
      .pipe(map(res => res.data));
  }
}
