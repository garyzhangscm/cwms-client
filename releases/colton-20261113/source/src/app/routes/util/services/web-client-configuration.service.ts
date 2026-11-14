import { Injectable } from '@angular/core';
import { SettingsService, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WebClientConfiguration } from '../models/web-client-configuration';

@Injectable({
  providedIn: 'root'
})
export class WebClientConfigurationService {

  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private companyService: CompanyService, 
    private settings: SettingsService) { }

  loadWebClientConfiguration(): Observable<WebClientConfiguration>{
    let url = `resource/web-client-configuration`;
    url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
    url = `${url}&warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;
    url = `${url}&username=${this.settings.user.name}`;

    return this.http.get(url).pipe(map(res => res.data));


  }

  
  setWebClientConfiguration(webClientConfiguration: WebClientConfiguration): void {
    // We will save the current warehouse in local storage so that
    // different tab / web broswer session can share the same warehouse id
    // sessionStorage.setItem('current_warehouse', JSON.stringify(warehouse));
    console.log(`=====         setWebClientConfiguration  ========`);
    localStorage.setItem('web_client_configuration', JSON.stringify(webClientConfiguration));
  }
  getWebClientConfiguration(): WebClientConfiguration {
    return JSON.parse(localStorage.getItem('web_client_configuration')!);
  }
  isTabVisible(name: string) : boolean{ 
    
    // by default, we will show all tab
    // we will hide the tab only when it is explicitly hidden by configuration
    let displayFlag = true;
    const webClientConfiguration: WebClientConfiguration = this.getWebClientConfiguration();
    if (webClientConfiguration 
        && webClientConfiguration.tabDisplayConfiguration) {
          displayFlag = webClientConfiguration.tabDisplayConfiguration[name] === undefined ? 
               true : webClientConfiguration.tabDisplayConfiguration[name];


    }
 
    return displayFlag;
  }
}
