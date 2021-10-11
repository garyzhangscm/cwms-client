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

  getQCInspectionRequest(inventoryId? : number, inventoryIds?: string, lpn?: string) : Observable<QcInspectionRequest[]> {
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
    
    
    return this.http.get(url).pipe(map(res => res.data));

  }
  
  getPendingQCInspectionRequest(inventoryId? : number, inventoryIds?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests/pending?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
    if (inventoryId) {
      url = `${url}&inventoryId=${inventoryId}`;
    }
    if (inventoryIds) {
      url = `${url}&inventoryIds=${inventoryIds}`;
    }
    
    
    return this.http.get(url).pipe(map(res => res.data));

  }

  savePendingQCInspectionRequest(qcInspectionRequests: QcInspectionRequest[]) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`; 
    
    return this.http.post(url, qcInspectionRequests).pipe(map(res => res.data));

  }

  getQCInspectionResult(lpn?: string) : Observable<QcInspectionRequest[]> {
    let url = `inventory/qc-inspection-requests/result?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
    
    if (lpn) {
      url = `${url}&lpn=${lpn}`;
    }
    
    
    return this.http.get(url).pipe(map(res => res.data));

  }
   
}
