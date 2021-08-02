import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventorySnapshot } from '../models/inventory-snapshot';
import { InventorySnapshotDetail } from '../models/inventory-snapshot-detail';

@Injectable({
  providedIn: 'root'
})
export class InventorySnapshotService {

  constructor(
    private http: _HttpClient,  
    private warehouseService: WarehouseService, 
  ) {}

  
  getInventorySnapshot(batchNumber?: string, status?: string): Observable<InventorySnapshot[]> {
    
    let url = `inventory/inventory_snapshot?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (batchNumber) {
      url = `${url}&batchNumber=${batchNumber}`;
    }
    if (status) {
      url = `${url}&status=${status}`;
    }
    
    return this.http
      .get(url)
      .pipe(map(res => res.data));
      
  }
  
  
  
  getInventorySnapshotDetails(batchNumber: string): Observable<InventorySnapshotDetail[]> {
    
    return this.http
      .get(`inventory/inventory_snapshot/${batchNumber}/details?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));
      
  }
  
  generateInventorySnapshot(): Observable<InventorySnapshot> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `inventory/inventory_snapshot?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    
    return this.http
      .post(url)
      .pipe(map(res => res.data));
      
  }


}
