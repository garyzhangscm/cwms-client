import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Carton } from '../models/carton';

@Injectable({
  providedIn: 'root',
})
export class CartonService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAllPickingCarton(name?: string, enabled?: boolean): Observable<Carton[]> {
    return this.getAll(name, enabled, true, undefined);
  }
  getAllShippingCarton(name?: string, enabled?: boolean): Observable<Carton[]> {
    return this.getAll(name, enabled, undefined, true);
  }
  getAll(
    name?: string,
    enabled?: boolean,
    pickingCartonFlag?: boolean,
    shippingCartonFlag?: boolean,
  ): Observable<Carton[]> {
    let url = `outbound/cartons?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (name) {
      url = `${url}&name=${name}`;
    }
    if (enabled) {
      url = `${url}&enabled=${enabled}`;
    }
    if (pickingCartonFlag) {
      url = `${url}&pickingCartonFlag=${pickingCartonFlag}`;
    }
    if (shippingCartonFlag) {
      url = `${url}&shippingCartonFlag=${shippingCartonFlag}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  get(id: number): Observable<Carton> {
    return this.http.get(`outbound/cartons/${id}`).pipe(map(res => res.data));
  }

  add(carton: Carton): Observable<Carton> {
    return this.http
      .post(`outbound/cartons?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, carton)
      .pipe(map(res => res.data));
  }

  change(carton: Carton): Observable<Carton> {
    const url = `outbound/cartons/${carton.id}`;
    return this.http.put(url, carton).pipe(map(res => res.data));
  }
}
