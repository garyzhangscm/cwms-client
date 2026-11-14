import { Injectable } from '@angular/core';
import { _HttpClient, SettingsService } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { SystemConfiguration } from '../models/system-configuration';

@Injectable({
  providedIn: 'root'
})
export class SystemConfigurationService {

  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,) { }

  getSystemConfiguration(): Observable<SystemConfiguration> {
    let url = `resource/system-configuration`;
    url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
    url = `${url}&warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;

    return this.http.get(url).pipe(map(res => res.data));


  }
  saveSystemConfiguration(systemConfiguration: SystemConfiguration): Observable<SystemConfiguration> {
    let url = `resource/system-configuration`;

    return this.http.post(url, systemConfiguration).pipe(map(res => res.data));


  }

}
