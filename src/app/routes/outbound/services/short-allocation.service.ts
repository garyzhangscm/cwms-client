import { Injectable } from '@angular/core';
import { ShortAllocation } from '../models/short-allocation';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class ShortAllocationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getShortAllocationsByShipment(shipmentId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(null, null, null, shipmentId);
  }
  getShortAllocationsByOrder(orderId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(null, orderId, null, null);
  }
  getShortAllocationsByWorkOrder(workOrderId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(null, null, workOrderId, null);
  }
  getShortAllocationsByWave(waveId: number): Observable<ShortAllocation[]> {
    return this.getShortAllocations(null, null, null, null, waveId);
  }
  getShortAllocations(
    itemNumber?: string,
    orderId?: number,
    workOrderId?: number,
    shipmentId?: number,
    waveId?: number,
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
    if (waveId) {
      url = `${url}&waveId=${waveId}`;
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
}
