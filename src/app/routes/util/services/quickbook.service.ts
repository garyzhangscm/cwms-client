import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class QuickbookService {

  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService,
    private warehouserService: WarehouseService) { }

 getToken(authCode: string, realmId: string): Observable<string> {
   let url = `quickbook/requestToken`;
   url = `${url}?authCode=${authCode}`;
   url = `${url}&realmId=${realmId}`;
   url = `${url}&companyId=${this.companyService.getCurrentCompany()!.id}`;
   url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
   
      return this.http.post(url).pipe(map(res => res.data));
  }
  
  refreshToken(realmId: string): Observable<string> {
      
    let url = `quickbook/refreshToken`;
    url = `${url}?realmId=${realmId}`;
    url = `${url}&companyId=${this.companyService.getCurrentCompany()!.id}`;
    url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
          
    return this.http.post(url).pipe(map(res => res.data));
  }
}
