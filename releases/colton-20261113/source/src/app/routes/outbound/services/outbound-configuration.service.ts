import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OutboundConfiguration } from '../models/outbound-configuration';

@Injectable({
  providedIn: 'root'
})
export class OutboundConfigurationService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getOutboundConfiguration(): Observable<OutboundConfiguration> { 
  
    return this.http
      .get(`outbound/outbound-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
   
  addOutboundConfiguration(outboundConfiguration: OutboundConfiguration): Observable<OutboundConfiguration> { 

    let url = `outbound/outbound-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.put(url, outboundConfiguration)
      .pipe(map(res => res.data));
  }

  changeOutboundConfiguration(outboundConfiguration: OutboundConfiguration): Observable<OutboundConfiguration> { 

    let url = `outbound/outbound-configuration/${outboundConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.post(url, outboundConfiguration)
      .pipe(map(res => res.data));
  }
}
