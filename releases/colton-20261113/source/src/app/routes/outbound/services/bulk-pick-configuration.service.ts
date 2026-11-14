import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BulkPickConfiguration } from '../models/bulk-pick-configuration';

@Injectable({
  providedIn: 'root'
})
export class BulkPickConfigurationService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getBulkPickConfiguration(refresh: boolean = false): Observable<BulkPickConfiguration> { 
  
    return this.http
      .get(`outbound/bulk-pick-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
   
  addBulkPickConfiguration(bulkPickConfiguration: BulkPickConfiguration): Observable<BulkPickConfiguration> { 

    let url = `outbound/bulk-pick-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.put(url, bulkPickConfiguration)
      .pipe(map(res => res.data));
  }

  changeBulkPickConfiguration(bulkPickConfiguration: BulkPickConfiguration): Observable<BulkPickConfiguration> { 

    let url = `outbound/bulk-pick-configuration/${bulkPickConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.post(url, bulkPickConfiguration)
      .pipe(map(res => res.data));
  }

}
