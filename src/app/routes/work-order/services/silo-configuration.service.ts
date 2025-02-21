import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { SiloConfiguration } from '../models/silo-configuration';

@Injectable({
  providedIn: 'root'
})
export class SiloConfigurationService {
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService, 
  ) {}

  
  getSiloConfiguration(     
  ): Observable<SiloConfiguration> {
    const url = `workorder/silo-configuration`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
 
  addSiloConfiguration(    
    siloConfiguration: SiloConfiguration,
  ): Observable<SiloConfiguration> {
    
    const url = `workorder/silo-configuration`; 
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    
    return this.http.put(url, siloConfiguration, params).pipe(map(res => res.data));
  }
  
  changeSiloConfiguration(    
    siloConfiguration: SiloConfiguration,
  ): Observable<SiloConfiguration> {
    
    const url = `workorder/silo-configuration/${siloConfiguration.id}`; 
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    
    return this.http.post(url, siloConfiguration, params).pipe(map(res => res.data));
  }

}
