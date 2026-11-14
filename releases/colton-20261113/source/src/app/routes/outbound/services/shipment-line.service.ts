import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { Shipment } from '../models/shipment';
import { ShipmentLine } from '../models/shipment-line';
import { Wave } from '../models/wave';

@Injectable({
  providedIn: 'root',
})
export class ShipmentLineService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getShipmentLinesByOrder(orderId: number): Observable<ShipmentLine[]> {
    return this.getShipmentLines(orderId, undefined);
  }
  getShipmentLinesByWave(waveId: number): Observable<ShipmentLine[]> {
    return this.getShipmentLines(undefined, waveId);
  }

  getShipmentLines(orderId?: number, waveId?: number): Observable<ShipmentLine[]> {
    let url = `outbound/shipment-lines?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (orderId) {
      url = `${url}&orderId=${orderId}`;
    }
    if (waveId) {
      url = `${url}&waveId=${waveId}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
}
