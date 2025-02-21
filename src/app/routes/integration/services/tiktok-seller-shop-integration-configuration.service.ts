import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { IntegrationCustomerData } from '../models/integration-customer-data'; 
import { TiktokSellerShopIntegrationConfiguration } from '../models/tiktok-seller-shop-integration-configuration';

@Injectable({
  providedIn: 'root',
})
export class TiktokSellerShopIntegrationConfigurationService {
  constructor(private http: _HttpClient, 
    private companyService: CompanyService) {}

    getTiktokSellerShopIntegrationConfiguration(clientId?: number): Observable<TiktokSellerShopIntegrationConfiguration[]> {
      const url = `integration/tiktok-config/seller-shop-integration/configuration`;
        
      let params = new HttpParams(); 
      params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
      if (clientId != null) {
        
          params = params.append('clientId', clientId); 
      }
      return this.http.get(url, params).pipe(map(res => res.data));
    } 
    removeTiktokSellerShopIntegrationConfiguration(id: number): Observable<String> {
      const url = `integration/tiktok-config/seller-shop-integration/configuration/${id}`;
        
      let params = new HttpParams(); 
      params = params.append('companyId', this.companyService.getCurrentCompany()!.id);  
      return this.http.delete(url, params).pipe(map(res => res.data));
    } 
    changeTiktokSellerShopIntegrationConfiguration(tiktokSellerShopIntegrationConfiguration: TiktokSellerShopIntegrationConfiguration): Observable<TiktokSellerShopIntegrationConfiguration> {
      const url = `integration/tiktok-config/seller-shop-integration/configuration/${tiktokSellerShopIntegrationConfiguration.id}`;
        
      let params = new HttpParams(); 
      params = params.append('companyId', this.companyService.getCurrentCompany()!.id);   
      
      return this.http.put(url, tiktokSellerShopIntegrationConfiguration, params).pipe(map(res => res.data));
    } 
    
    getTiktokTTSAuthLink(clientId?: number): Observable<string> {
      const url = `integration/tiktok-config/seller-shop-integration/seller-auth/url`;
        
      let params = new HttpParams(); 
      params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
      if (clientId != null) {
        
          params = params.append('clientId', clientId); 
      }
      return this.http.get(url, params).pipe(map(res => res.data));
      
    } 
}
