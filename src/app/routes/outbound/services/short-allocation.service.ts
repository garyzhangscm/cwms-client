import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderBillOfMaterialComponent } from '../../work-order/bill-of-material/bill-of-material.component';
import { WorkOrder } from '../../work-order/models/work-order';
import { ShortAllocation } from '../models/short-allocation';

@Injectable({
  providedIn: 'root',
})
export class ShortAllocationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getShortAllocationsByShipment(shipmentId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(undefined, undefined, undefined, shipmentId);
  }
  getShortAllocationsByOrder(orderId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(undefined, orderId, undefined, undefined);
  }
  getShortAllocationsByLoad(trailerAppointId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(undefined,
      undefined,undefined,undefined,undefined,undefined,trailerAppointId);
  }
  getShortAllocationsByWorkOrder(workOrder: WorkOrder): Observable<ShortAllocation[]> {
    let workOrderLineIds : string = 
        workOrder.workOrderLines.filter(workOrderLine => workOrderLine.id !== undefined && workOrderLine.id !== null)
        .map(workOrderLine => workOrderLine.id).join(",");
        
    if (workOrderLineIds.length > 0) {
      return this.getShortAllocationsByWorkOrderLines(workOrderLineIds);
    }
    else {

      return of([]);
      
    }
  }
  getShortAllocationsByWorkOrderLines(workOrderIds: string): Observable<ShortAllocation[]> {
    return this.getShortAllocations(undefined, undefined, undefined, undefined, undefined, workOrderIds);
  }
  getShortAllocationsByWave(waveId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(undefined, undefined, undefined, undefined, waveId);
  }
  getShortAllocations(
    itemNumber?: string,
    orderId?: number,
    workOrderId?: number,
    shipmentId?: number,
    waveId?: number,
    workOrderLineIds?: string, 
    trailerAppointmentId?: number,
    loadDetails?: boolean,
  ): Observable<ShortAllocation[]> {
    let url = `outbound/shortAllocations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (itemNumber) {
      url = `${url}&itemNumber=${itemNumber}`;
    }
    if (orderId) {
      url = `${url}&orderId=${orderId}`;
    }

    if (workOrderId) {
      url = `${url}&workOrderId=${workOrderId}`;
    }
    if (shipmentId) {
      url = `${url}&shipmentId=${shipmentId}`;
    }
    if (trailerAppointmentId) {
      url = `${url}&trailerAppointmentId=${trailerAppointmentId}`;
    }
    if (waveId) {
      url = `${url}&waveId=${waveId}`;
    }
    if (workOrderLineIds) {
      url = `${url}&workOrderLineIds=${workOrderLineIds}`;

    }
    if (loadDetails != null) {

      url = `${url}&loadDetails=${loadDetails}`;
    }
    else {

      url = `${url}&loadDetails=true`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getShortAllocation(id: number): Observable<ShortAllocation> {
    return this.http.get(`outbound/shortAllocations/${id}`).pipe(map(res => res.data));
  }

  addShortAllocation(shortAllocation: ShortAllocation): Observable<ShortAllocation> {
    return this.http.post(`outbound/shortAllocations`, shortAllocation).pipe(map(res => res.data));
  }

  changeShortAllocation(shortAllocation: ShortAllocation): Observable<ShortAllocation> {
    const url = `outbound/shortAllocations/${shortAllocation.id}`;
    return this.http.put(url, shortAllocation).pipe(map(res => res.data));
  }

  cancelShortAllocations(shortAllocations: ShortAllocation[]): Observable<ShortAllocation[]> {
    const shortAllocationIds: number[] = [];
    shortAllocations.forEach(shortAllocation => {
      shortAllocationIds.push(shortAllocation.id);
    });
    const params = {
      shortAllocation_ids: shortAllocationIds.join(','),
    };

    return this.http.delete('outbound/shortAllocations', params).pipe(map(res => res.data));
  }

  allocateShortAllocation(shortAllocation: ShortAllocation): Observable<ShortAllocation> {
    const url = `outbound/shortAllocations/${shortAllocation.id}/allocate`;
    return this.http.post(url).pipe(map(res => res.data));
  }
  
  createWorkOrder(shortAllocation: ShortAllocation, bomId: number, workOrderNumber: string, workOrderQuantity: number): Observable<ShortAllocation> {
    let url = `outbound/shortAllocations/${shortAllocation.id}/create-work-order`;
    url = `${url}?bomId=${bomId}`;
    url = `${url}&workOrderNumber=${workOrderNumber}`;
    url = `${url}&workOrderQuantity=${workOrderQuantity}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
} 
