
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { WarehouseConfiguration } from '../models/warehouse-configuration';
import { CompanyService } from './company.service';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private localStorageService: LocalStorageService,
    private companyService: CompanyService) {} 

  getWarehouseConfiguration(refresh: boolean = false, warehouseId?: number): Observable<WarehouseConfiguration> { 


    const localStorageKey = 
        warehouseId == null ? `warehouse-configuration-${this.warehouseService.getCurrentWarehouse().id}` :
        `warehouse-configuration-${warehouseId}`;

    if (!refresh) {
      const data = this.localStorageService.getItem(localStorageKey);
      if (data != null) {
        return of(data);
      }
    }
    if (warehouseId != null) {

      return this.http
      .get(`layout/warehouse-configuration/by-warehouse/${warehouseId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(localStorageKey, res)));
    }
    else {

      return this.http
      .get(`layout/warehouse-configuration/by-warehouse/${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(localStorageKey, res)));
    }

  }
   
  saveWarehouseConfiguration(warehouseConfiguration: WarehouseConfiguration): Observable<WarehouseConfiguration> {
    const localStorageKey = `warehouse-configuration-${this.warehouseService.getCurrentWarehouse().id}`

    let url = `layout/warehouse-configuration?companyId=${this.companyService.getCurrentCompany()!.id}`;
      
    return this.http.post(url, warehouseConfiguration)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(localStorageKey, res)));
  }
}
