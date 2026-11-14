import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventorySnapshot } from '../models/inventory-snapshot';
import { InventorySnapshotDetail } from '../models/inventory-snapshot-detail';
import { InventorySnapshotSummary } from '../models/inventory-snapshot-summary';

@Injectable({
  providedIn: 'root'
})
export class InventorySnapshotService {

  constructor(
    private http: _HttpClient,  
    private warehouseService: WarehouseService,  
    private dateTimeService: DateTimeService,
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
  
  getInventorySnapshotSummaryByVelocity(startTime?: Date, endTime?:Date): Observable<InventorySnapshotSummary[]> {
    let url = `inventory/inventory_snapshot/summary/by-velocity?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    if (startTime) {
      url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
    }

    return this.http
      .get(url)
      .pipe(map(res => res.data));
      
  }
  getInventorySnapshotSummaryByABCCategory(startTime?: Date, endTime?:Date): Observable<InventorySnapshotSummary[]> {
    let url = `inventory/inventory_snapshot/summary/by-abc-category?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    if (startTime) {
      url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
    }

    return this.http
      .get(url)
      .pipe(map(res => res.data));
      
  }
  getInventorySnapshotSummaryQuantity(startTime?: Date, endTime?:Date): Observable<InventorySnapshotSummary[]> {
    let url = `inventory/inventory_snapshot/summary/quantity?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    if (startTime) {
      url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
    }

    return this.http
      .get(url)
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

  generateInventorySnapshotFile(batchNumber : string):  Observable<string> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `inventory/inventory_snapshot/${batchNumber}/files?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    
    return this.http
      .post(url)
      .pipe(map(res => res.data));
      
  }

  removeInventorySnapshotFile(batchNumber : string):  Observable<string> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `inventory/inventory_snapshot/${batchNumber}/files?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    
    return this.http
      .delete(url)
      .pipe(map(res => res.data));
      
  }
  
  downloadInventorySnapshotFile(batchNumber : string):  Observable<string> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `inventory/inventory_snapshot/${batchNumber}/files/download?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    
    return this.http
      .get(url, null, { responseType: 'blob' });
      
  }


}
