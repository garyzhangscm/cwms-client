import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QuickbookOnlineConfiguration } from '../models/quickbook-online-configuration';

@Injectable({
  providedIn: 'root'
})
export class QuickbookOnlineConfigurationService {

  
  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService,
    private warehouserService: WarehouseService) { }


  getConfiguration(): Observable<QuickbookOnlineConfiguration> {
    let url = `quickbook/online/configuration`;
    url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
    url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
    
       return this.http.get(url).pipe(map(res => res.data));
   }
   saveConfiguration(quickbookOnlineConfiguration: QuickbookOnlineConfiguration): Observable<QuickbookOnlineConfiguration> {
     let url = `quickbook/online/configuration`;
     url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
     url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
     
        return this.http.post(url, quickbookOnlineConfiguration).pipe(map(res => res.data));
    }
}
