import { Injectable } from '@angular/core';
import { PickWork } from '../models/pick-work';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Inventory } from '../../inventory/models/inventory';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class PickService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getPicksByOrder(orderId: number): Observable<PickWork[]> {
    return this.getPicks(null, orderId);
  }
  getPicksByShipment(shipmentId: number): Observable<PickWork[]> {
    return this.getPicks(null, null, shipmentId);
  }
  getPicksByWorkOrder(workOrderId: number): Observable<PickWork[]> {
    return this.getPicks(null, null, null, workOrderId);
  }
  getPicksByWave(waveId: number): Observable<PickWork[]> {
    return this.getPicks(null, null, null, null, waveId);
  }
  getPicks(
    number?: string,
    orderId?: number,
    shipmentId?: number,
    workOrderId?: number,
    waveId?: number,
    itemId?: number,
    sourceLocationId?: number,
    destinationLocationId?: number,
  ): Observable<PickWork[]> {
    let url = `outbound/picks?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }

    if (orderId) {
      url = `${url}&orderId=${orderId}`;
    }
    if (shipmentId) {
      url = `${url}&shipmentId=${shipmentId}`;
    }
    if (workOrderId) {
      url = `${url}&workOrderId=${workOrderId}`;
    }
    if (waveId) {
      url = `${url}&waveId=${waveId}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (sourceLocationId) {
      url = `${url}&sourceLocationId=${sourceLocationId}`;
    }
    if (destinationLocationId) {
      url = `${url}&destinationLocationId=${destinationLocationId}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getPick(id: number): Observable<PickWork> {
    return this.http.get(`outbound/picks/${id}`).pipe(map(res => res.data));
  }

  addPick(pick: PickWork): Observable<PickWork> {
    return this.http.post(`outbound/picks`, pick).pipe(map(res => res.data));
  }

  changePick(pick: PickWork): Observable<PickWork> {
    const url = `outbound/picks/${pick.id}`;
    return this.http.put(url, pick).pipe(map(res => res.data));
  }
  cancelPick(pick: PickWork): Observable<PickWork> {
    const url = `outbound/picks/${pick.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  cancelPicks(picks: PickWork[]): Observable<PickWork[]> {
    const pickIds: number[] = [];
    picks.forEach(pick => {
      pickIds.push(pick.id);
    });
    const params = {
      pick_ids: pickIds.join(','),
    };

    return this.http.delete('outbound/picks', params).pipe(map(res => res.data));
  }

  confirmPick(pick: PickWork, quantity?: number): Observable<PickWork> {
    const confirmedQuantity = quantity === undefined ? pick.quantity - pick.pickedQuantity : quantity;
    return this.http.post(`outbound/picks/${pick.id}/confirm?quantity=${confirmedQuantity}`).pipe(map(res => res.data));
  }

  getPickedInventories(picks: PickWork[]): Observable<Inventory[]> {
    const pickIds = picks.map(pick => pick.id).join(',');
    return this.http
      .get(`inventory/inventories?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&pickIds=${pickIds}`)
      .pipe(map(res => res.data));
  }
}
