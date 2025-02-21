import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ReceiptLine } from '../models/receipt-line';
import { ReceivingTransaction } from '../models/receiving-transaction';

@Injectable({
  providedIn: 'root',
})
export class ReceivingTransactionService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService) {}
 
  getReceivingTransactions(receiptId?: number, receiptLineId?: number): Observable<ReceivingTransaction[]> {
    const url = `inbound/receiving-transactions`;
     
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (receiptId != null) {
      params = params.append('receiptId', receiptId); 

    }
    if (receiptLineId != null) {
      params = params.append('receiptLineId', receiptLineId); 

    }
    return this.http.get(url, params).pipe(map(res => res.data));
  }
 
}
