import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationItemPackageTypeData } from '../models/integration-item-package-type-data';
import { IntegrationDataService } from './integration-data.service';

@Injectable({
  providedIn: 'root',
})
export class IntegrationItemPackageTypeDataService {
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private integrationDataService: IntegrationDataService) {}

	
    getData(startTime?: Date, endTime?:Date, date?: Date): Observable<IntegrationItemPackageTypeData[]> {
      let url = `integration/integration-data/item-package-types?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
      if (startTime) {
        url = `${url}&startTime=${this.integrationDataService.getISODateTimeString(startTime)}`;
      }
      if (endTime) {
        url = `${url}&endTime=${this.integrationDataService.getISODateTimeString(endTime)}`;
      }
      if (date) {
        url = `${url}&date=${this.integrationDataService.getISODateString(date)}`;
      }
      return this.http.get(url).pipe(map(res => res.data));
    }

    
}
