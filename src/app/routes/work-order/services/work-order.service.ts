import { Injectable } from '@angular/core';
import { WorkOrder } from '../models/work-order';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkOrders(number: string, itemName: string): Observable<WorkOrder[]> {
    let url = `workorder/work-orders?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getWorkOrder(id: number): Observable<WorkOrder> {
    return this.http.get(`workorder/work-orders/${id}`).pipe(map(res => res.data));
  }

  addWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    return this.http.post(`workorder/work-orders`, workOrder).pipe(map(res => res.data));
  }

  changeWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    const url = `workorder/work-orders/${workOrder.id}`;
    return this.http.put(url, workOrder).pipe(map(res => res.data));
  }

  removeWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    const url = `workorder/work-orders/${workOrder.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeWorkOrders(workOrders: WorkOrder[]): Observable<WorkOrder[]> {
    const workOrderIds: number[] = [];
    workOrders.forEach(workOrder => {
      workOrderIds.push(workOrder.id);
    });
    const params = {
      workOrderIds: workOrderIds.join(','),
    };
    return this.http.delete('workorder/work-orders', params).pipe(map(res => res.data));
  }

  allocateWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    return this.http.post(`workorder/work-orders/${workOrder.id}/allocate`).pipe(map(res => res.data));
  }
}
