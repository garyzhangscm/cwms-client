import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LightMesConfiguration } from '../models/light-mes-configuration';

@Injectable({
  providedIn: 'root'
})
export class LightMesConfigurationService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getLightMesConfiguration(): Observable<LightMesConfiguration> { 
  
    return this.http
      .get(`workorder/light-mes-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
   
  addLightMesConfiguration(lightMESConfiguration: LightMesConfiguration): Observable<LightMesConfiguration> { 

    let url = `workorder/light-mes-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.put(url, lightMESConfiguration)
      .pipe(map(res => res.data));
  }

  changeLightMesConfiguration(lightMESConfiguration: LightMesConfiguration): Observable<LightMesConfiguration> { 

    let url = `workorder/light-mes-configuration/${lightMESConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.post(url, lightMESConfiguration)
      .pipe(map(res => res.data));
  }
}
