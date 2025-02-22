import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18NService } from 'src/app/core/i18n/i18n.service';
 
import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service'; 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Receipt } from '../models/receipt';
import { ReceiptBillableActivity } from '../models/receipt-billable-activity';
import { ReceiptLineBillableActivity } from '../models/receipt-line-billable-activity';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  private RECEIPT_LINE_PER_PAGE = 20;
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService, 
    private dateTimeService: DateTimeService, 
    private utilService: UtilService
  ) { }

  getReceipts(number?: string, loadDetails?: boolean, statusList?: string, 
    supplierName?: string, 
    checkInStartTime?: Date, checkInEndTime?:Date, checkInSpecificDate?: Date, purchaseOrderId?: number, 
    clientName?: string, clientId?: string): Observable<Receipt[]> {
    const url = `inbound/receipts`;
     
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', this.utilService.encodeHttpParameter(number.trim()));  
    }
    if (loadDetails !== undefined && loadDetails!= null) {
      params = params.append('loadDetails', loadDetails);  
    }
    if (statusList) {
      params = params.append('receipt_status_list', statusList);  
    }
    if (supplierName) {
      params = params.append('supplierName', supplierName);  
    }
    if (clientName) {
      params = params.append('clientName', clientName);  
    }
    if (clientId) {
      params = params.append('clientId', clientId);  
    }
    if (purchaseOrderId) {
      params = params.append('purchaseOrderId', purchaseOrderId);  
    }

    if (checkInStartTime) {
      params = params.append('checkInStartTime', this.dateTimeService.getISODateTimeString(checkInStartTime));  
    }
    if (checkInEndTime) {
      params = params.append('checkInEndTime', this.dateTimeService.getISODateTimeString(checkInEndTime));  
    }
    if (checkInSpecificDate) {
      params = params.append('checkInDate', this.dateTimeService.getISODateString(checkInSpecificDate));  
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getReceipt(id: number, ignoreNotFoundError?: boolean): Observable<Receipt> {
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (ignoreNotFoundError != null) {
      params = params.append('ignoreNotFoundError', ignoreNotFoundError);  
    }

    return this.http.get(`inbound/receipts/${id}`, params).pipe(map(res => res.data));
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
  
  getReceivedInventoryFromReceiptList(receiptIds: string): Observable<Inventory[]> { 
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('receiptIds', receiptIds);

    return this.http.get(`inbound/receipts/inventories`, params).pipe(map(res => res.data));
  }



  printReceivingDocument(receipt: Receipt, locale?: string, printerName?: string): Observable<ReportHistory> {


    let params = new HttpParams();
    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);

    if (printerName) {
      
        params = params.append('printerName', printerName);
    }

    return this.http.post(`inbound/receipts/${receipt.id}/receiving-document`, null, params).pipe(map(res => res.data));
  }

  printPutawayDocument(receipt: Receipt, inventoryIds: number[], notPutawayInventoryOnly = false, locale?: string): Observable<ReportHistory> {

    const url = `inbound/receipts/${receipt.id}/putaway-document`

    let params = new HttpParams();
    if (!locale) {
      locale = this.i18n.defaultLang;
    }    
    params = params.append('locale', locale);

    if (inventoryIds.length > 0) {
      params = params.append('inventoryIds', inventoryIds.join(','));
      // url = `${url}&inventoryIds=${inventoryIds.join(',')}`;
    }
    // url = `${url}&notPutawayInventoryOnly=${notPutawayInventoryOnly}`;
    params = params.append('notPutawayInventoryOnly', notPutawayInventoryOnly);

    return this.http.post(url, null, params).pipe(map(res => res.data));
  }

  
  addReceiptBillableActivity(receiptId: number, 
    receiptBillableActivity: ReceiptBillableActivity): Observable<ReceiptBillableActivity> {

    const url = `inbound/receipts/${receiptId}/billable-activities`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.put(url, receiptBillableActivity, params).pipe(map(res => res.data));
  }
  removeReceiptBillableActivity(receiptId: number,  id: number): Observable<string> {

    const url = `inbound/receipts/${receiptId}/billable-activities/${id}`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.delete(url, params).pipe(map(res => res.data));
  }
  addReceiptLineBillableActivity(receiptLineId: number, 
    receiptLineBillableActivity: ReceiptLineBillableActivity): Observable<ReceiptLineBillableActivity> {

    const url = `inbound/receipts/lines/${receiptLineId}/billable-activities`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.put(url, receiptLineBillableActivity, params).pipe(map(res => res.data));
  }
  removeReceiptLineBillableActivity(receiptLineId: number, id: number): Observable<string> {

    const url = `inbound/receipts/lines/${receiptLineId}/billable-activities/${id}`

    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  

    return this.http.delete(url, params).pipe(map(res => res.data));
  }

  
  generatePrePrintLPNReportInBatch(receiptId: number, 
      lpnLabelCountByReceiptLines: Map<number, number>, 
       lpnQuantityOnLabelByReceiptLines: Map<number, number>, 
       ignoreInventoryQuantityByReceiptLines: Map<number, boolean>,
       lpn?: string, printerName?: string) : Observable<ReportHistory> {
    
        console.log(`lpnLabelCountByReceiptLines.size: ${lpnLabelCountByReceiptLines.size}`);
        console.log(`lpnQuantityOnLabelByReceiptLines.size: ${lpnQuantityOnLabelByReceiptLines.size}`);
        console.log(`ignoreInventoryQuantityByReceiptLines.size: ${ignoreInventoryQuantityByReceiptLines.size}`); 

    const url = `inbound/receipts/${receiptId}/pre-print-lpn-label/batch`;
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (lpn) {
      params = params.append('lpn', lpn);  
    }   
    if (printerName) {
      params = params.append('printerName', printerName);    
    }
    // we will need to convert the Map into object so that we can pass it to the server
    const lpnLabelCountByReceiptLinesMap: { [key: number]:  number} = {};
    const lpnQuantityOnLabelByReceiptLinesMap: { [key: number]:  number} = {};
    const ignoreInventoryQuantityByReceiptLinesMap: { [key: number]:  boolean} = {};
    lpnLabelCountByReceiptLines.forEach((val: number, key: number) => {
      lpnLabelCountByReceiptLinesMap[key] = val;
    });
    lpnQuantityOnLabelByReceiptLines.forEach((val: number, key: number) => {
      lpnQuantityOnLabelByReceiptLinesMap[key] = val;
    });
    ignoreInventoryQuantityByReceiptLines.forEach((val: boolean, key: number) => {
      ignoreInventoryQuantityByReceiptLinesMap[key] = val;
    });
    
    return this.http.post(url, 
      {lpnLabelCountByReceiptLines: lpnLabelCountByReceiptLinesMap, 
        lpnQuantityOnLabelByReceiptLines: lpnQuantityOnLabelByReceiptLinesMap, 
        ignoreInventoryQuantityByReceiptLines: ignoreInventoryQuantityByReceiptLinesMap,
      }, 
      params).pipe(map(res => res.data));
  }
}
