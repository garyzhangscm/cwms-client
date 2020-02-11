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

  getPicks(
    number?: string,
    orderId?: number,
    itemId?: number,
    sourceLocationId?: number,
    destinationLocationId?: number,
  ): Observable<PickWork[]> {
    let params = '';
    if (number) {
      params = `number=${number}`;
    }

    if (orderId) {
      params = `${params}&orderId=${orderId}`;
    }
    if (itemId) {
      params = `${params}&itemId=${itemId}`;
    }
    if (sourceLocationId) {
      params = `${params}&sourceLocationId=${sourceLocationId}`;
    }
    if (destinationLocationId) {
      params = `${params}&destinationLocationId=${destinationLocationId}`;
    }

    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = 'outbound/picks' + (params.length > 0 ? '?' + params : '');

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
