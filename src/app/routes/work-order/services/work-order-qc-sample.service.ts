import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderQcSample } from '../models/work-order-qc-sample';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderQcSampleService {
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
  ) { }

  getWorkOrderQcSamples(productionLineAssignmentId?: number, number?: string): Observable<WorkOrderQcSample[]> {
    
    let url = `workorder/qc-samples?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (productionLineAssignmentId) {
      url = `${url}&productionLineAssignmentId=${productionLineAssignmentId}`;
    }
    
    if (number) {
      url = `${url}&number=${number}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  addWorkOrderQcSample(workOrderQcSample: WorkOrderQcSample): Observable<WorkOrderQcSample[]> {
    
    let url = `workorder/qc-samples?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.put(url, workOrderQcSample).pipe(map(res => res.data));
  }

  
  removeWorkOrderQcSample(workOrderQcSampleId: number): Observable<WorkOrderQcSample[]> {
    
    let url = `workorder/qc-samples/${workOrderQcSampleId}`;
    
    
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
