import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LocationUtilizationSnapshotBatch } from '../models/location-utilization-snapshot-batch';

@Injectable({
  providedIn: 'root'
})
export class LocationUtilizationSnapshotBatchService {

  constructor(
    private http: _HttpClient,  
    private warehouseService: WarehouseService, 
  ) {}

  
  getLocationUtilizationSnapshotBatches(number?: string, status?: string): Observable<LocationUtilizationSnapshotBatch[]> {
    
    let url = `inventory/location-utilization-snapshot-batches?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    if (number) {
      url = `${url}&number=${number}`;
    }
    if (status) {
      url = `${url}&status=${status}`;
    }
    
    return this.http
      .get(url)
      .pipe(map(res => res.data));
      
  }
  generateLocationUtilizationSnapshotBatch(): Observable<LocationUtilizationSnapshotBatch> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    const url = `inventory/location-utilization-snapshot-batches?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    
    return this.http
      .post(url)
      .pipe(map(res => res.data));
      
  }
}
