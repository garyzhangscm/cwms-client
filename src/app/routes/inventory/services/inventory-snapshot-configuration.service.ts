import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { InventorySnapshotConfiguration } from '../models/inventory-snapshot-configuration';

@Injectable({
  providedIn: 'root'
})
export class InventorySnapshotConfigurationService {

  constructor(
    private http: _HttpClient,  
    private warehouseService: WarehouseService, 
  ) {}


  getInventorySnapshotConfiguration(): Observable<InventorySnapshotConfiguration> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    
    
    return this.http
      .get(`inventory/inventory_snapshot_configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));
      
  }
  

  updateInventorySnapshotConfiguration(inventorySnapshotConfiguration: InventorySnapshotConfiguration): Observable<InventorySnapshotConfiguration> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    
    
    return this.http
      .post(
        `inventory/inventory_snapshot_configuration`, 
        inventorySnapshotConfiguration)
      .pipe(map(res => res.data));
      
  }
}
