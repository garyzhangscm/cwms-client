

import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { Observable  } from 'rxjs';
import { map } from 'rxjs/operators';
 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { EasyPostCarrier } from '../models/easy-post-carrier';
import { EasyPostConfiguration } from '../models/easy-post-configuration';

@Injectable({
  providedIn: 'root'
})
export class EasyPostConfigurationService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService, 
  ) {}
  
  getConfiguration(): Observable<EasyPostConfiguration> { 
    return this.http
      .get(`outbound/easy-post-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data)); 
  }

  addConfiguration(easyPostConfiguration: EasyPostConfiguration): Observable<EasyPostConfiguration> {
    return this.http.put(`outbound/easy-post-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, easyPostConfiguration)
    .pipe(map(res => res.data));
  }

  changeConfiguration(easyPostConfiguration: EasyPostConfiguration): Observable<EasyPostConfiguration> {
    return this.http.post(`outbound/easy-post-configuration/${easyPostConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, easyPostConfiguration)
    .pipe(map(res => res.data));
  }

  addCarrier(easyPostConfigurationId: number, easyPostCarrier: EasyPostCarrier): Observable<EasyPostCarrier> {
    return this.http.put(`outbound/easy-post-configuration/${easyPostConfigurationId}/carriers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, 
    easyPostCarrier).pipe(map(res => res.data));
  }

  changeCarrier(easyPostConfigurationId: number, easyPostCarrier: EasyPostCarrier): Observable<EasyPostCarrier> {
    return this.http.post(`outbound/easy-post-configuration/${easyPostConfigurationId}/carriers/${easyPostCarrier.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, 
    easyPostCarrier).pipe(map(res => res.data));
  }
   
  removeCarrier(easyPostConfigurationId: number, easyPostCarrierId: number): Observable<EasyPostCarrier> {
    return this.http.delete(`outbound/easy-post-configuration/${easyPostConfigurationId}/carriers/${easyPostCarrierId}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
    .pipe(map(res => res.data));
  }
 
}
