import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { Shipment } from '../models/shipment';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Wave } from '../models/wave';
import { Order } from '../models/order';
import { ShipmentLine } from '../models/shipment-line';

@Injectable({
  providedIn: 'root',
})
export class ShipmentLineService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getShipmentLinesByOrder(orderId: number): Observable<ShipmentLine[]> {
    return this.getShipmentLines(orderId, null);
  }
  getShipmentLinesByWave(waveId: number): Observable<ShipmentLine[]> {
    return this.getShipmentLines(null, waveId);
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
