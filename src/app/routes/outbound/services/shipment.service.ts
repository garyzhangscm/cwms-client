import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { Shipment } from '../models/shipment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ShipmentService {
  constructor(private http: _HttpClient) {}

  getShipments(number: string): Observable<Shipment[]> {
    const url = number ? `outbound/shipments?number=${number}` : `outbound/shipments`;

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
}
