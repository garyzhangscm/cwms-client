import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Warehouse } from '../models/warehouse';
import { CompanyService } from './company.service';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  constructor(private http: _HttpClient, private companyService: CompanyService) { }

  getWarehouses(): Observable<Warehouse[]> {
    if (this.companyService.getCurrentCompany() == null) {
      return of([]);
    }
    return this.http
      .get(`layout/warehouses?companyId=${this.companyService.getCurrentCompany()!.id}`)
      .pipe(map(res => res.data));
  }

  getWarehouse(id: number): Observable<Warehouse> {
    
    //let params = new HttpParams();
    //params = params.append('warehouseId', id);
    return this.http.get(`layout/warehouses/${  id}`).pipe(map(res => res.data));
  }

  getWarehouseByUser(companyCode: string, username: string): Observable<Warehouse[]> {

    const url = `layout/warehouses/accessible/${companyCode}/${username}`;
    
    let params = new HttpParams();
    
    params = params.append('companyCode', companyCode);
    
    console.log(`start to get warehouse from ${url}`);
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  addWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http
      .post(`layout/warehouses?companyId=${this.companyService.getCurrentCompany()!.id}`, warehouse)
      .pipe(map(res => res.data));
  }

  changeWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    const url = `layout/warehouses/${  warehouse.id}`;
    return this.http.put(url, warehouse).pipe(map(res => res.data));
  }

  removeWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    const url = `layout/warehouses/${warehouse.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  setCurrentWarehouse(warehouse: Warehouse): void {
    // We will save the current warehouse in local storage so that
    // different tab / web broswer session can share the same warehouse id
    // sessionStorage.setItem('current_warehouse', JSON.stringify(warehouse));
    localStorage.setItem('current_warehouse', JSON.stringify(warehouse));
  }
  getCurrentWarehouse(): Warehouse {
    return JSON.parse(localStorage.getItem('current_warehouse')!);
  }


  setServerSidePrintingFlag(serverSidePrinting: boolean): void {
    // We will save the current warehouse in local storage so that
    // different tab / web broswer session can share the same warehouse id
    // sessionStorage.setItem('current_warehouse', JSON.stringify(warehouse));
    localStorage.setItem('server_side_printing', JSON.stringify(serverSidePrinting));
  }
  getServerSidePrintingFlag(): boolean {
    return JSON.parse(localStorage.getItem('server_side_printing')!);
  }

  
  getAvailableZoneIds(): Observable<string[]> {
     
    return this.http.get(`resource/site-information/available-zone-ids`).pipe(map(res => res.data));
  }
 
}
