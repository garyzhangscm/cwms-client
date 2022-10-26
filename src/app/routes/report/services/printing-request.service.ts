import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Printer } from '../models/printer';
import { PrintingRequest } from '../models/printing-request';

@Injectable({
  providedIn: 'root'
})
export class PrintingRequestService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  generatePrintingRequestByReportHistory(
    reportHistoryId: number,
    printerName: string, copies: number
  ): Observable<PrintingRequest> {
    let url = `resource/printing-requests/by-report-history?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    url = `${url}&reportHistoryId=${reportHistoryId}`;
    url = `${url}&name=${httpUrlEncodingCodec.encodeValue(printerName.trim())}`;
    url = `${url}&printerName=${printerName}`;
    url = `${url}&copies=${copies}`; 

    return this.http.put(url).pipe(map(res => res.data));
  }
  
  
}
