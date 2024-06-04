import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
 
import { CompanyService } from '../../warehouse-layout/services/company.service';  
import { ShopifyOAuthUrl } from '../models/shopify-oauth-url';

@Injectable({
  providedIn: 'root',
})
export class ShopifyOAuthService {
  constructor(private http: _HttpClient, 
    private companyService: CompanyService) {}

    getOAuthUrl(clientId?: number): Observable<ShopifyOAuthUrl> {
      const url = `integration/shopify/shop-oauth/url`;
        
      let params = new HttpParams(); 
      params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
      if (clientId != null) {
        
          params = params.append('clientId', clientId); 
      }
      return this.http.get(url, params).pipe(map(res => res.data));
    } 
     
}
