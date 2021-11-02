import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrder } from '../../work-order/models/work-order';
import { PickWork } from '../models/pick-work';

@Injectable({
  providedIn: 'root',
})
export class PickService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getPicksByOrder(orderId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, orderId);
  }
  getPicksByOrderNumber(orderNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      orderNumber,
    );
  }
  getPicksByShipment(shipmentId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, shipmentId);
  }
  getPicksByShipmentNumber(shipmentNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      shipmentNumber,
    );
  }
  getPicksByWorkOrder(workOrder: WorkOrder): Observable<PickWork[]> {
    const workOrderLineIds: number[] = [];
    workOrder.workOrderLines.forEach(workOrderLine => {
      workOrderLineIds.push(workOrderLine.id!);
    });

    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      workOrderLineIds.join(','),
    );
  }
  getPicksByWorkOrderNumber(workOrderNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      workOrderNumber,
    );
  }
  getPicksByWave(waveId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, waveId);
  }
  getPicksByWaveNumber(waveNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      waveNumber,
    );
  }
  getPicksByPickList(pickListId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, pickListId);
  }
  getPicksByPickListNumber(pickListNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      pickListNumber,
    );
  }
  getPicksByShortAllocation(shortAllocationId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, undefined, shortAllocationId);
  }
  getPicksByCartonization(cartonizationId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, undefined, undefined, cartonizationId);
  }
  getPicksByCartonizationNumber(cartonizationNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      cartonizationNumber,
    );
  }
  getPicksByIds(ids: string): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ids);
  }
  getPicksByContainerId(containerId: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      containerId,
    );
  }

  queryPicks(
    number?: string,
    orderNumber?: string,
    itemNumber?: string,
    sourceLocation?: string,
    destinationLocation?: string,
    shortAllocationId?: number,
  ): Observable<PickWork[]> {
    return this.getPicks(
      number,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      shortAllocationId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      itemNumber,
      sourceLocation,
      destinationLocation,
      orderNumber,
    );
  }
  getPickBySourceLocationIdAndItemId(itemId: number, sourceLocationId: number) : Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      itemId,
      sourceLocationId
    );
  }
  getOpenPicksBySourceLocationIdAndItemId(itemId: number, sourceLocationId: number) : Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      itemId,
      sourceLocationId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    );
  }
  getPicks(
    number?: string,
    orderId?: number,
    shipmentId?: number,
    workOrderId?: number,
    waveId?: number,
    listId?: number,
    shortAllocationId?: number,
    cartonizationId?: number,
    ids?: string,
    itemId?: number,
    sourceLocationId?: number,
    destinationLocationId?: number,
    itemNumber?: string,
    sourceLocationName?: string,
    destinationLocationName?: string,
    orderNumber?: string,
    shipmentNumber?: string,
    workOrderNumber?: string,
    waveNumber?: string,
    pickListNumber?: string,
    cartonizationNumber?: string,
    containerId?: string,
    workOrderLineIds?: string, 
    openPickOnly?: boolean
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
    if (ids) {
      url = `${url}&ids=${ids}`;
    }
    if (listId) {
      url = `${url}&listId=${listId}`;
    }
    if (cartonizationId) {
      url = `${url}&cartonizationId=${cartonizationId}`;
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
    if (shortAllocationId) {
      url = `${url}&shortAllocationId=${shortAllocationId}`;
    }

    if (orderNumber) {
      url = `${url}&orderNumber=${orderNumber}`;
    }

    if (shipmentNumber) {
      url = `${url}&shipmentNumber=${shipmentNumber}`;
    }

    if (workOrderNumber) {
      url = `${url}&workOrderNumber=${workOrderNumber}`;
    }
    if (waveNumber) {
      url = `${url}&waveNumber=${waveNumber}`;
    }

    if (pickListNumber) {
      url = `${url}&pickListNumber=${pickListNumber}`;
    }
    if (cartonizationNumber) {
      url = `${url}&cartonizationNumber=${cartonizationNumber}`;
    }
    if (itemNumber) {
      url = `${url}&itemNumber=${itemNumber}`;
    }
    if (sourceLocationName) {
      url = `${url}&sourceLocationName=${sourceLocationName}`;
    }
    if (destinationLocationName) {
      url = `${url}&destinationLocationName=${destinationLocationName}`;
    }
    if (containerId) {
      url = `${url}&containerId=${containerId}`;
    }
    if (workOrderLineIds) {
      url = `${url}&workOrderLineIds=${workOrderLineIds}`;
    }
    if (openPickOnly != null) {
      url = `${url}&openPickOnly=${openPickOnly}`;

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

  confirmPick(
    pick: PickWork,
    quantity?: number,
    pickToContainer?: boolean,
    containerId?: string,
  ): Observable<PickWork> {
    const confirmedQuantity = quantity === undefined ? pick.quantity - pick.pickedQuantity : quantity;
    let url = `outbound/picks/${pick.id}/confirm?quantity=${confirmedQuantity}`;

    if (pickToContainer) {
      url = `${url}&pickToContainer=${pickToContainer}`;
    }
    if (containerId) {
      url = `${url}&containerId=${containerId}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }

  getPickedInventories(picks: PickWork[], includeVirturalInventory?: boolean): Observable<Inventory[]> {
    const pickIds = picks.map(pick => pick.id).join(',');
    let url = `inventory/inventories?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&pickIds=${pickIds}`;
    if (includeVirturalInventory) {
      url = `${url}&includeVirturalInventory=${includeVirturalInventory}`;
    }

    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
}
