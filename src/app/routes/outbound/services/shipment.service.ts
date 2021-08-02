import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { Shipment } from '../models/shipment';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getShipments(number: string): Observable<Shipment[]> {
    let url = `outbound/shipments?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getShipment(id: number): Observable<Shipment> {
    return this.http.get(`outbound/shipments/${id}`).pipe(map(res => res.data));
  }

  addShipment(shipment: Shipment): Observable<Shipment> {
    return this.http.post(`outbound/shipments`, shipment).pipe(map(res => res.data));
  }

  changeShipment(shipment: Shipment): Observable<Shipment> {
    const url = `outbound/shipments/${shipment.id}`;
    return this.http.put(url, shipment).pipe(map(res => res.data));
  }

  cancelShipment(shipment: Shipment): Observable<Shipment> {
    const url = `outbound/shipments/${shipment.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  cancelShipments(shipments: Shipment[]): Observable<Shipment[]> {
    const shipmentIds: number[] = [];
    shipments.forEach(shipment => {
      shipmentIds.push(shipment.id);
    });
    const params = {
      shipment_ids: shipmentIds.join(','),
    };
    return this.http.delete('outbound/shipments', params).pipe(map(res => res.data));
  }

  completeShipment(shipment: Shipment): Observable<Shipment> {
    const url = `outbound/shipments/${shipment.id}/complete`;
    return this.http.put(url).pipe(map(res => res.data));
  }

  allocateShipment(shipment: Shipment): Observable<Shipment> {
    const url = `outbound/shipments/${shipment.id}/allocate`;
    return this.http.put(url).pipe(map(res => res.data));
  }

  stageShipment(shipment: Shipment): Observable<Shipment> {
    return this.http.post(`outbound/shipments/${shipment.id}/stage`).pipe(map(res => res.data));
  }

  loadTrailer(shipment: Shipment): Observable<Shipment> {
    return this.http.post(`outbound/shipments/${shipment.id}/load`).pipe(map(res => res.data));
  }

  dispatchTrailer(shipment: Shipment): Observable<Shipment> {
    return this.http.post(`outbound/shipments/${shipment.id}/dispatch`).pipe(map(res => res.data));
  }
}
