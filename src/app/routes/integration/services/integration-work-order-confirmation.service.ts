import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationWorkOrderConfirmation } from '../models/integration-work-order-confirmation';
import { IntegrationDataService } from './integration-data.service';

@Injectable({
  providedIn: 'root',
})
export class IntegrationWorkOrderConfirmationService {
  
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private integrationDataService: IntegrationDataService) {}

    
  getData(startTime?: Date, endTime?:Date, date?: Date): Observable<IntegrationWorkOrderConfirmation[]> {
    let url = `integration/integration-data/work-order-confirmations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
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