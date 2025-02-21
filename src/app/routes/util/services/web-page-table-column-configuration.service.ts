import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CompanyService } from '../../warehouse-layout/services/company.service';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { FileUploadResult } from '../models/file-upload-result';
import { FileUploadType } from '../models/file-upload-type';
import { WebPageTableColumnConfiguration } from '../models/web-page-table-column-configuration';

@Injectable({
  providedIn: 'root',
})
export class WebPageTableColumnConfigurationService {
  constructor(private http: _HttpClient,  
    private companyService: CompanyService,) {}

  getWebPageTableColumnConfigurations(webPageName?: string,
    tableName?: string, columnName?: string,): Observable<WebPageTableColumnConfiguration[]> {
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id);  
     

    if (webPageName) {
      
        params = params.append('webPageName', webPageName);  
    }
    if (tableName) {
      
        params = params.append('tableName', tableName);  
    }
    if (columnName) {
      
        params = params.append('columnName', columnName);  
    }

    return this.http.get('resource/web-page-table-column-configuration', params).pipe(map(res => res.data));
  }
     
  addWebPageTableColumnConfigurations(webPageTableColumnConfigurations: WebPageTableColumnConfiguration[]): Observable<WebPageTableColumnConfiguration[]> {
    
    if (webPageTableColumnConfigurations.length == 0) {
      return of(webPageTableColumnConfigurations);
    }
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id);   

    return this.http.put('resource/web-page-table-column-configuration/add-by-page-and-table', 
        webPageTableColumnConfigurations, params).pipe(map(res => res.data));
  }

}
