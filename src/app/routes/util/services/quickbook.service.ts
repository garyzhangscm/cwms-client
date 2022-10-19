import { HttpParams, HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QuickbookOnlineToken } from '../models/quickbook-online-token';

@Injectable({
  providedIn: 'root'
})
export class QuickbookService {

  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService,
    private warehouserService: WarehouseService) { }

    
 getCurrentToken(): Observable<QuickbookOnlineToken> {
  let url = `quickbook/current-token`;
  url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
  url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
  
     return this.http.get(url).pipe(map(res => res.data));
 }

 requestToken(authCode: string, realmId: string): Observable<QuickbookOnlineToken> {
   let url = `quickbook/requestToken`;
   url = `${url}?authCode=${authCode}`;
   url = `${url}&realmId=${realmId}`;
   url = `${url}&companyId=${this.companyService.getCurrentCompany()!.id}`;
   url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
   
      return this.http.post(url).pipe(map(res => res.data));
  }
  
  refreshToken(realmId: string): Observable<QuickbookOnlineToken> {
      
    let url = `quickbook/refreshToken`;
    url = `${url}?realmId=${realmId}`;
    url = `${url}&companyId=${this.companyService.getCurrentCompany()!.id}`;
    url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
          
    return this.http.post(url).pipe(map(res => res.data));
  }
  
  syncEntity(entityName: string, syncTransactionDays?: number): Observable<number> {
      
    let url = `quickbook/data/sync/${entityName}`; 
    url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
    url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`;
    if (syncTransactionDays != null) {
      
        url = `${url}&syncTransactionDays=${syncTransactionDays}`;
    }
          
    return this.http.post(url).pipe(map(res => res.data));
  }

  sendWebhook(signature: string, payload: string): Observable<string> {
      
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    let url = `quickbook/webhook`; 
    // url = `${url}?companyId=${this.companyService.getCurrentCompany()!.id}`;
    // url = `${url}&warehouseId=${this.warehouserService.getCurrentWarehouse().id}`; 
    
    let params = new HttpParams();
    // params = params.append('signature', httpUrlEncodingCodec.encodeValue(signature.trim()));
    // params = params.append('payload', httpUrlEncodingCodec.encodeValue(payload.trim()));
    
    params = params.append('signature', signature.trim());
    params = params.append('payload', payload.trim());
    // url = `${url}&signature=${httpUrlEncodingCodec.encodeValue(signature.trim())}`;
    // url = `${url}&payload=${httpUrlEncodingCodec.encodeValue(payload.trim())}`;

    return this.http.post(url, {
      signature: signature.trim(),
      payload: payload.trim()
    }, ).pipe(map(res => res.data));
  }
}
