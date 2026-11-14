import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { RfConfiguration } from '../models/rf-configuration';

@Injectable({
  providedIn: 'root'
})
export class RfConfigurationService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService
  ) {}

  
  getRfConfiguration(rfCode?: string): Observable<RfConfiguration> {
     

    let url = `resource/rf-configurations?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    if (rfCode) {
      url = `${url}&rfCode=${rfCode}`;
    }
      
    
    return this.http.get(url).pipe(map(res => res.data));
  }
  saveRfConfiguration(rfConfiguration: RfConfiguration): Observable<RfConfiguration> {
     

    let url = `resource/rf-configurations?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`; 
      
    
    return this.http.post(url, rfConfiguration).pipe(map(res => res.data));
  }
}
