import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { HualeiConfiguration } from '../models/hualei-configuration';

@Injectable({
  providedIn: 'root'
})
export class HualeiConfigurationService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getHualeiConfiguration(): Observable<HualeiConfiguration> { 
  
    return this.http
      .get(`outbound/hualei-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
   
  addHualeiConfiguration(hualeiConfiguration: HualeiConfiguration): Observable<HualeiConfiguration> { 

    let url = `outbound/hualei-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.put(url, hualeiConfiguration)
      .pipe(map(res => res.data));
  }

  changeHualeiConfiguration(hualeiConfiguration: HualeiConfiguration): Observable<HualeiConfiguration> { 

    let url = `outbound/hualei-configuration/${hualeiConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.post(url, hualeiConfiguration)
      .pipe(map(res => res.data));
  }

}
