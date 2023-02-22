import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Printer } from '../models/printer';
import { PrintingRequest } from '../models/printing-request';
import { ReportType } from '../models/report-type.enum';

@Injectable({
  providedIn: 'root'
})
export class PrintingRequestService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private utilService: UtilService) {}

  generatePrintingRequestByReportHistory(
    reportHistoryId: number,
    printerName: string, copies: number
  ): Observable<PrintingRequest> {
    let url = `resource/printing-requests/by-report-history`;
    let params = new HttpParams();
    
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);
    params = params.append('reportHistoryId', reportHistoryId); 
    params = params.append('printerName',  this.utilService.encodeHttpParameter(printerName.trim()));
    params = params.append('copies', copies);

    return this.http.put(url, undefined, params).pipe(map(res => res.data));
  }
  generatePrintingRequestByUrl(
    reportUrl: string, reportType: ReportType, 
    printerName: string, copies: number
  ): Observable<PrintingRequest> {
    let url = `resource/printing-requests/by-url`;
    
    let params = new HttpParams(); 
    
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);
    params = params.append('url', this.utilService.encodeHttpParameter(reportUrl.trim()));
    params = params.append('printerName',  this.utilService.encodeHttpParameter(printerName.trim()));
    params = params.append('reportType',  reportType);
    params = params.append('copies', copies);
 
    return this.http.put(url, undefined, params).pipe(map(res => res.data));
  }
  
  
}
