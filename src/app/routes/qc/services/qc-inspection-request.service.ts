import { HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { locale } from 'moment-timezone';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { ReportHistory } from '../../report/models/report-history';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QCInspectionResult } from '../models/qc-inspection-result';

@Injectable({
  providedIn: 'root'
})
export class QcInspectionRequestService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private utilService: UtilService) {}

  getQCInspectionRequests(inventoryId? : number, inventoryIds?: string, lpn?: string,  number?: string, 
    type?: string, qcInspectionResult?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    if (inventoryId) {
      url = `${url}&inventoryId=${inventoryId}`;
    }
    if (inventoryIds) {
      url = `${url}&inventoryIds=${inventoryIds}`;
    }
    
    if (lpn) {
      url = `${url}&lpn=${lpn}`;
    }
    
    if (number) {
      url = `${url}&number=${number}`;
    }
    if (type) {
      url = `${url}&type=${type}`;
    }
    if (qcInspectionResult) {
      url = `${url}&qcInspectionResult=${qcInspectionResult}`;
    }
    
    
    return this.http.get(url).pipe(map(res => res.data));

  }
  getQCInspectionRequest(id: number) : Observable<QcInspectionRequest> {
    let url = `inventory/qc-inspection-request/${id}?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  
  addQCInspectionRequest(qcInspectionRequest: QcInspectionRequest) : Observable<QcInspectionRequest> {
    let url = `inventory/qc-inspection-requests?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    return this.http.put(url, qcInspectionRequest).pipe(map(res => res.data));
  }
  
  changeQCInspectionRequest(qcInspectionRequest: QcInspectionRequest) : Observable<QcInspectionRequest> {
    let url = `inventory/qc-inspection-requests/${qcInspectionRequest.id}?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    return this.http.put(url, qcInspectionRequest).pipe(map(res => res.data));
  }
  
  getPendingQCInspectionRequest(inventoryId? : number, inventoryIds?: string, lpn?: string,  number?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests/pending?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    if (inventoryId) {
      url = `${url}&inventoryId=${inventoryId}`;
    }
    if (inventoryIds) {
      url = `${url}&inventoryIds=${inventoryIds}`;
    }
    if (lpn) {
      url = `${url}&lpn=${lpn}`;
    }
    
    if (number) {
      url = `${url}&number=${number}`;
    }
    
    
    return this.http.get(url).pipe(map(res => res.data));

  }

  saveQCInspectionRequest(qcInspectionRequests: QcInspectionRequest[]) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`; 
    
    return this.http.post(url, qcInspectionRequests).pipe(map(res => res.data));

  }

  getQCInspectionResult(lpn?: string, workOrderQCSampleNumber?: string, number?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests/result?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
     
    if (lpn) {
      url = `${url}&lpn=${this.utilService.encodeValue(lpn.trim())}`;
    }
    
    if (workOrderQCSampleNumber) {
      url = `${url}&workOrderQCSampleNumber=${workOrderQCSampleNumber}`;
    }
     

    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    
    
    return this.http.get(url).pipe(map(res => res.data));

  }

  
  validateLPNForInspectionByQCRequest(id: number, lpn: string) : Observable<Inventory[]>{
    const url = `inventory/qc-inspection-requests/${id}/inspect-by-request/validate-lpn?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&lpn=${lpn}`;
    return this.http.post(url).pipe(map(res => res.data));
  }

  
  generateQCInspectionRequestReport(id: number, locale?: string) : Observable<ReportHistory>{
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);
    
    const url = `inventory/qc-inspection-requests/${id}/report`;
    return this.http.post(url, null, params).pipe(map(res => res.data));
  }

  changeQCInspectionDocument(qcInspectionRequest: QcInspectionRequest)  : Observable<QcInspectionRequest>{
     

    const url = `inventory/qc-inspection-requests/${qcInspectionRequest.id}/change-document-urls?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&documentUrls=${this.utilService.encodeValue(qcInspectionRequest.documentUrls.trim())}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
   
}
