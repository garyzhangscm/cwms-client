import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventoryAgingSnapshot } from '../models/inventory-aging-snapshot';

@Injectable({
  providedIn: 'root'
})
export class InventoryAgingSnapshotService {
  constructor(
    private http: _HttpClient,  
    private warehouseService: WarehouseService, 
  ) {}

  
  getInventoryAgingSnapshots(number?: string, status?: string): Observable<InventoryAgingSnapshot[]> {
    
    const url = `inventory/inventory-aging-snapshots`;

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    if (number) {
      params = params.append('number', number);   
    }
    if (status) {
      params = params.append('status', status);    
    }
    
    return this.http
      .get(url, params)
      .pipe(map(res => res.data));
      
  }
  generateInventoryAgingSnapshot(): Observable<InventoryAgingSnapshot> { 
    const url = `inventory/inventory-aging-snapshots`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http
      .post(url, undefined, params)
      .pipe(map(res => res.data));
      
  }
  
  removeInventoryAgingSnapshot(id: number): Observable<InventoryAgingSnapshot> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `inventory/inventory-aging-snapshots/${id}`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  
    
    return this.http
      .delete(url, params)
      .pipe(map(res => res.data));
      
  }
}
