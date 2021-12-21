import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QCInspectionResult } from '../models/qc-inspection-result';

@Injectable({
  providedIn: 'root'
})
export class QcInspectionRequestService {

  constructor(private http: _HttpClient, private warehosueService: WarehouseService) {}

  getQCInspectionRequests(inventoryId? : number, inventoryIds?: string, lpn?: string,  number?: string, 
    type?: string, qcInspectionResult?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
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
    let url = `inventory/qc-inspection-requests/${id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  
  addQCInspectionRequest(qcInspectionRequest: QcInspectionRequest) : Observable<QcInspectionRequest> {
    let url = `inventory/qc-inspection-requests?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
    return this.http.put(url, qcInspectionRequest).pipe(map(res => res.data));
  }
  
  changeQCInspectionRequest(qcInspectionRequest: QcInspectionRequest) : Observable<QcInspectionRequest> {
    let url = `inventory/qc-inspection-requests/${qcInspectionRequest.id}?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
    return this.http.put(url, qcInspectionRequest).pipe(map(res => res.data));
  }
  
  getPendingQCInspectionRequest(inventoryId? : number, inventoryIds?: string, lpn?: string,  number?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests/pending?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
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
    let url = `inventory/qc-inspection-requests?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`; 
    
    return this.http.post(url, qcInspectionRequests).pipe(map(res => res.data));

  }

  getQCInspectionResult(lpn?: string, workOrderQCSampleNumber?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests/result?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
    
    if (lpn) {
      url = `${url}&lpn=${lpn}`;
    }
    
    if (workOrderQCSampleNumber) {
      url = `${url}&workOrderQCSampleNumber=${workOrderQCSampleNumber}`;
    }
    
    return this.http.get(url).pipe(map(res => res.data));

  }
   
}
