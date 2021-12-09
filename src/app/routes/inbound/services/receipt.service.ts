import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18NService } from 'src/app/core/i18n/i18n.service';

import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Receipt } from '../models/receipt';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  private RECEIPT_LINE_PER_PAGE = 20;

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private printingService: PrintingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  getReceipts(number?: string, loadDetails?: boolean): Observable<Receipt[]> {
    let url = `inbound/receipts?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    

    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    if (loadDetails !== undefined && loadDetails!= null) {
      url = `${url}&loadDetails=${loadDetails}`;
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
      receiptIds.push(receipt.id!);
    });
    const params = {
      receipt_ids: receiptIds.join(','),
    };
    return this.http.delete('inbound/receipts', params).pipe(map(res => res.data));
  }

  checkInReceipt(receipt: Receipt): Observable<Receipt> {
    return this.http.put(`inbound/receipts/${receipt.id}/check-in`).pipe(map(res => res.data));
  }

  closeReceipt(receipt: Receipt): Observable<Receipt> {
    return this.http.post(`inbound/receipts/${receipt.id}/complete`).pipe(map(res => res.data));
  }
  getReceivedInventory(receipt: Receipt): Observable<Inventory[]> {
    return this.http.get(`inbound/receipts/${receipt.id}/inventories`).pipe(map(res => res.data));
  }


  printReceivingDocument(receipt: Receipt, locale?: string): Observable<ReportHistory> {


    if (!locale) {
      locale = this.i18n.defaultLang;
    }

    return this.http.post(`inbound/receipts/${receipt.id}/receiving-document?locale=${locale}`).pipe(map(res => res.data));
  }

  printPutawayDocument(receipt: Receipt, inventoryIds: number[], notPutawayInventoryOnly = false, locale?: string): Observable<ReportHistory> {


    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    let url = `inbound/receipts/${receipt.id}/putaway-document?locale=${locale}`
    if (inventoryIds.length > 0) {
      url = `${url}&inventoryIds=${inventoryIds.join(',')}`;
    }
    url = `${url}&notPutawayInventoryOnly=${notPutawayInventoryOnly}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
