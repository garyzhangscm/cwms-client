
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GzLocalStorageService } from '../../util/services/gz-local-storage.service'; 
import { WarehouseConfiguration } from '../models/warehouse-configuration';
import { CompanyService } from './company.service';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class WarehouseConfigurationService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private gzLocalStorageService: GzLocalStorageService,
    private companyService: CompanyService) {} 

  getWarehouseConfiguration(refresh: boolean = false): Observable<WarehouseConfiguration> { 

    const localStorageKey = `warehouse-configuration-${this.warehouseService.getCurrentWarehouse().id}`

    if (!refresh) {
      const data = this.gzLocalStorageService.getItem(localStorageKey);
      if (data != null) {
        return of(data);
      }
    }
    return this.http
      .get(`layout/warehouse-configuration/by-warehouse/${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(localStorageKey, res)));

  }
   
  saveWarehouseConfiguration(warehouseConfiguration: WarehouseConfiguration): Observable<WarehouseConfiguration> {
    const localStorageKey = `warehouse-configuration-${this.warehouseService.getCurrentWarehouse().id}`

    let url = `layout/warehouse-configuration?companyId=${this.companyService.getCurrentCompany()!.id}`;
      
    return this.http.post(url, warehouseConfiguration)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(localStorageKey, res)));
  }
}
