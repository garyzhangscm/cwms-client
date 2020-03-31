import { Injectable } from '@angular/core';
import { Warehouse } from '../models/warehouse';
import { Observable } from 'rxjs';
import { _HttpClient } from '@delon/theme';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  constructor(private http: _HttpClient) {}

  getWarehouses(): Observable<Warehouse[]> {
    return this.http.get('layout/warehouses').pipe(map(res => res.data));
  }

  getWarehouse(id: number): Observable<Warehouse> {
    return this.http.get('layout/warehouses/' + id).pipe(map(res => res.data));
  }

  getWarehouseByUser(username: string): Observable<Warehouse[]> {
    const url = 'layout/warehouses/accessible/' + username;
    console.log(`start to get warehouse from ${url}`);
    return this.http.get(url).pipe(map(res => res.data));
  }

  addWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.post('layout/warehouses', warehouse).pipe(map(res => res.data));
  }

  changeWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    const url = 'layout/warehouses/' + warehouse.id;
    return this.http.put(url, warehouse).pipe(map(res => res.data));
  }

  removeWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    const url = 'layout/warehouses/' + warehouse.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  setCurrentWarehouse(warehouse: Warehouse) {
    // We will save the current warehouse in local storage so that
    // different tab / web broswer session can share the same warehouse id
    // sessionStorage.setItem('current_warehouse', JSON.stringify(warehouse));
    localStorage.setItem('current_warehouse', JSON.stringify(warehouse));
  }
  getCurrentWarehouse(): Warehouse {
    return JSON.parse(localStorage.getItem('current_warehouse'));
  }
}
