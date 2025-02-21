import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { map } from 'rxjs/operators';
import { WorkOrder } from '../models/work-order';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderKpiService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkOrderKPIs(workOrderNumber?: string, username?: string): Observable<WorkOrderKpi[]> {
    let url = `workorder/work-order-kpis?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (workOrderNumber) {
      url = `${url}&workOrderNumber=${workOrderNumber}`;
    }
    if (username) {
      url = `${url}&username=${username}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getWorkOrderKPI(id: number): Observable<WorkOrderKpi> {
    return this.http.get(`workorder/work-order-kpis/${id}`).pipe(map(res => res.data));
  }
  addWorkOrderKPI(workOrderKpi: WorkOrderKpi): Observable<WorkOrderKpi> {
    return this.http.post(`workorder/work-order-kpis`, workOrderKpi).pipe(map(res => res.data));
  }
  changeWorkOrderKPI(workOrderKpi: WorkOrderKpi): Observable<WorkOrderKpi> {
    return this.http.get(`workorder/work-order-kpis/${workOrderKpi.id}`, workOrderKpi).pipe(map(res => res.data));
  }
}
