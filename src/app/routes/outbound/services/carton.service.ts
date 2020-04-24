import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { Carton } from '../models/carton';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartonService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAll(name?: string, enabled?: boolean): Observable<Carton[]> {
    let url = `outbound/cartons?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (name) {
      url = `${url}&name=${name}`;
    }
    if (enabled) {
      url = `${url}&enabled=${enabled}`;
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
