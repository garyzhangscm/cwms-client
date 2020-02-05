import { Injectable } from '@angular/core';
import { Receipt } from '../models/receipt';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { _HttpClient } from '@delon/theme';
import { Inventory } from '../../inventory/models/inventory';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getReceipts(number: string): Observable<Receipt[]> {
    let url = `inbound/receipts/?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getReceipt(id: number): Observable<Receipt> {
    return this.http.get(`inbound/receipts/${id}`).pipe(map(res => res.data));
  }

  addReceipt(receipt: Receipt): Observable<Receipt> {
    return this.http.post(`inbound/receipts`, receipt).pipe(map(res => res.data));
  }

  changeReceipt(receipt: Receipt): Observable<Receipt> {
    const url = `inbound/receipts/${receipt.id}`;
    return this.http.put(url, receipt).pipe(map(res => res.data));
  }

  removeReceipt(receipt: Receipt): Observable<Receipt> {
    const url = `inbound/receipts/${receipt.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeReceipts(receipts: Receipt[]): Observable<Receipt[]> {
    const receiptIds: number[] = [];
    receipts.forEach(receipt => {
      receiptIds.push(receipt.id);
    });
    const params = {
      receipt_ids: receiptIds.join(','),
    };
    return this.http.delete('inbound/receipts', params).pipe(map(res => res.data));
  }

  checkInReceipt(receipt: Receipt): Observable<Receipt> {
    return this.http.put(`inbound/receipts/${receipt.id}/check-in`).pipe(map(res => res.data));
  }

  getReceivedInventory(receipt: Receipt): Observable<Inventory[]> {
    return this.http.get(`inbound/receipts/${receipt.id}/inventories`).pipe(map(res => res.data));
  }
}
