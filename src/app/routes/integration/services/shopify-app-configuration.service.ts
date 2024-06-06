import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
 
import { CompanyService } from '../../warehouse-layout/services/company.service';   
import { ShopifyAppConfiguration } from '../models/shopify-app-configuration';

@Injectable({
  providedIn: 'root',
})
export class ShopifyAppConfigurationService {
  constructor(private http: _HttpClient, 
    private companyService: CompanyService) {}

    getOAuthUrl(clientId?: number): Observable<ShopifyAppConfiguration> {
      const url = `integration/shopify/app-configuration/oauth-url`;
        
      let params = new HttpParams(); 
      params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
      if (clientId != null) {
        
          params = params.append('clientId', clientId); 
      }
      return this.http.get(url, params).pipe(map(res => res.data));
    } 
     
}
