import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalCacheService } from '../../util/services/local-cache.service';
import { WarehouseConfiguration } from '../models/warehouse-configuration';
import { CompanyService } from './company.service';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService) {}

  getWarehouseConfiguration(): Observable<WarehouseConfiguration> {
    let url = `layout/warehouse-configuration/by-warehouse/${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.get(url)
    .pipe(map(res => res.data));
  }
   
  saveWarehouseConfiguration(warehouseConfiguration: WarehouseConfiguration): Observable<WarehouseConfiguration> {
    let url = `layout/warehouse-configuration?companyId=${this.companyService.getCurrentCompany()!.id}`;
      
    return this.http.post(url, warehouseConfiguration)
      .pipe(map(res => res.data))
      .pipe(tap(res => localStorage.removeItem(`warehouse-config-${this.warehouseService.getCurrentWarehouse}`)));
  }
}
