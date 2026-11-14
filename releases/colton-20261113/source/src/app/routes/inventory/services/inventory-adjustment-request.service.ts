import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryAdjustmentRequest } from '../models/inventory-adjustment-request';
import { InventoryAdjustmentRequestStatus } from '../models/inventory-adjustment-request-status.enum';
import { InventoryQuantityChangeType } from '../models/inventory-quantity-change-type.enum';


@Injectable({
  providedIn: 'root',
})
export class InventoryAdjustmentRequestService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getInventoryAdjustmentRequests(
    status?: InventoryAdjustmentRequestStatus,
    itemName?: string,
    locationName?: string,
    inventoryQuantityChangeType?: InventoryQuantityChangeType,
    inventoryId?: number,
  ): Observable<InventoryAdjustmentRequest[]> {
    let params = `warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (status) {
      params = `${params}&status=${status}`;
    }
    if (itemName) {
      params = `${params}&itemName=${itemName}`;
    }
    if (locationName) {
      params = `${params}&locationName=${locationName}`;
    }
    if (inventoryQuantityChangeType) {
      params = `${params}&inventoryQuantityChangeType=${inventoryQuantityChangeType}`;
    }
    if (inventoryId) {
      params = `${params}&inventoryId=${inventoryId}`;
    }

    const url = `inventory/inventory-adjustment-requests?${params}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  getInventoryAdjustmentRequestById(id: number): Observable<InventoryAdjustmentRequest> {
    const url = `inventory/inventory-adjustment-requests/${id}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  processInventoryAdjustmentRequest(
    inventoryAdjustmentRequest: InventoryAdjustmentRequest,
    approved: boolean,
    comment: string,
  ): Observable<InventoryAdjustmentRequest> {
    const url = `inventory/inventory-adjustment-requests/${inventoryAdjustmentRequest.id}/process?approved=${approved}&comment=${comment}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
