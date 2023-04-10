import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BulkPickConfiguration } from '../models/bulk-pick-configuration';
import { PickConfiguration } from '../models/pick-configuration';

@Injectable({
  providedIn: 'root'
})
export class PickConfigurationService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getPickConfiguration(): Observable<PickConfiguration> { 
  
    return this.http
      .get(`outbound/pick-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
   
  addPickConfiguration(pickConfiguration: PickConfiguration): Observable<PickConfiguration> { 

    let url = `outbound/pick-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.put(url, pickConfiguration)
      .pipe(map(res => res.data));
  }

  changePickConfiguration(pickConfiguration: PickConfiguration): Observable<PickConfiguration> { 

    let url = `outbound/pick-configuration/${pickConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.post(url, pickConfiguration)
      .pipe(map(res => res.data));
  }

}
