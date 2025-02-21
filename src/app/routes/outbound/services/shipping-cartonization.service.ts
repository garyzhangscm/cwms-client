import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ShippingCartonization } from '../models/shipping-cartonization';

interface PackingItem {
  itemName: string;
  quantity: number;
  packedQuantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class ShippingCartonizationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  pack(inventoryId: string, packingItems: PackingItem[], cartonId: number): Observable<ShippingCartonization> {
    const url = `outbound/shipping-cartonization?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
    }&inventoryId=${inventoryId}&cartonId=${cartonId}`;

    return this.http.post(url, packingItems).pipe(map(res => res.data));
  }
}
