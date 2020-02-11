import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { Shipment } from '../models/shipment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ShipmentLineService {
  constructor(private http: _HttpClient) {}

  getShipmentLines(orderNumber: string): Observable<Shipment[]> {
    const url = orderNumber ? `outbound/shipments?orderNumber=${orderNumber}` : `outbound/shipments`;

    return this.http.get(url).pipe(map(res => res.data));
  }
}
