import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderQcResult } from '../models/work-order-qc-result';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderQcResultService {

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
  ) { }

  getWorkOrderQcResults(number?: string, workOrderSampleNumber?: string, productionLineId?: number, 
    workOrderId?: number, workOrderNumber?: string): Observable<WorkOrderQcResult[]> {
    
    let url = `workorder/qc-results?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (number) {
      url = `${url}&number=${number}`;
    }
    if (workOrderSampleNumber) {
      url = `${url}&workOrderSampleNumber=${workOrderSampleNumber}`;
    }
    if (productionLineId) {
      url = `${url}&productionLineId=${productionLineId}`;
    }
    if (workOrderId) {
      url = `${url}&workOrderId=${workOrderId}`;
    } 
    if (workOrderNumber) {
      url = `${url}&workOrderNumber=${workOrderNumber}`;
    } 
    return this.http.get(url).pipe(map(res => res.data));
  }
}
