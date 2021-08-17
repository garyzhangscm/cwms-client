import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationInventoryAdjustmentConfirmation } from '../models/integration-inventory-adjustment-confirmation';

@Injectable({
  providedIn: 'root'
})
export class IntegrationDataService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService) {}

  getISODateTimeString(dateTime: Date) : string {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    console.log(`time offset: ${(new Date()).getTimezoneOffset()}`)
    console.log(`time offset in milliseconds: ${tzoffset}`)
    console.log(`dateTime: ${dateTime.toLocaleString()}`)
    console.log(`dateTime.getMilliseconds: ${dateTime.valueOf()}`)
    var localISOTime = (new Date(dateTime.valueOf() - tzoffset)).toISOString().slice(0, -1);
    return localISOTime;
  }

  getISODateString(dateTime: Date) : string {
    return this.getISODateTimeString(dateTime).substring(0, 10);
  }
}
