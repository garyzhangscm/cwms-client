import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderFlow } from '../models/work-order-flow';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderFlowService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkOrderFlows(name?: string, description?: string): Observable<WorkOrderFlow[]> {
    let url = `workorder/work-order-flows`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    if (name) {
      params = params.append('name', name);  
    }
    if (description) {
      params = params.append('description', description);   
    }

    return this.http.get(url,params).pipe(map(res => res.data));
  }

  getWorkOrderFlow(id: number): Observable<WorkOrderFlow> {
    return this.http.get(`workorder/work-order-flows/${id}`).pipe(map(res => res.data));
  } 
 
  addWorkOrderFlow(workOrderFlow: WorkOrderFlow): Observable<WorkOrderFlow> {
    return this.http.post(`workorder/work-order-flows`, workOrderFlow).pipe(map(res => res.data));
  }

  changeWorkOrderFlow(workOrderFlow: WorkOrderFlow): Observable<WorkOrderFlow> {
    const url = `workorder/work-order-flows/${workOrderFlow.id}`;
    return this.http.put(url, workOrderFlow).pipe(map(res => res.data));
  }

  removeWorkOrderFlow(workOrderFlow: WorkOrderFlow): Observable<WorkOrderFlow> {
    const url = `workorder/work-order-flows/${workOrderFlow.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  
  getWorkOrderFlowCandidate(): Observable<string[]> {
    const url = `workorder/work-order-flows/candidate`;
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
}
