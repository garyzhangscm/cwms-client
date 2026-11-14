import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { InboundQcConfiguration } from '../models/inbound-qc-configuration';
import { InboundReceivingConfiguration } from '../models/inbound-receiving-configuration';

@Injectable({
  providedIn: 'root'
})
export class InboundReceivingConfigurationService {

  constructor(private http: _HttpClient, private companyService: CompanyService) {}

  getInboundReceivingConfigurations(
    supplierId?: number, itemId?: number, itemName?: string, warehouseId?: number): Observable<InboundReceivingConfiguration[]> {
    const url = `inbound/inbound-receiving-configuration`;

    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    if (supplierId) {
      params = params.append('supplierId', supplierId);  
    }
    if (itemId) {
      params = params.append('itemId', itemId);   
    }
    if (itemName) {
      params = params.append('itemName', itemName);   
    }
    if (warehouseId) {
      params = params.append('warehouseId', warehouseId);    
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  getBestMatchInboundReceivingConfiguration(
    supplierId?: number, itemId?: number, itemName?: string, warehouseId?: number): Observable<InboundReceivingConfiguration> {
    const url = `inbound/inbound-receiving-configuration/best-match`;

    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    if (supplierId) {
      params = params.append('supplierId', supplierId);  
    }
    if (itemId) {
      params = params.append('itemId', itemId);   
    }
    if (itemName) {
      params = params.append('itemName', itemName);   
    }
    if (warehouseId) {
      params = params.append('warehouseId', warehouseId);    
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getInboundReceivingConfiguration(id: number): Observable<InboundReceivingConfiguration> {
    return this.http.get(`inbound/inbound-receiving-configuration/${id}`).pipe(map(res => res.data));
  } 
 
  addInboundReceivingConfiguration(inboundReceivingConfiguration: InboundReceivingConfiguration)
      : Observable<InboundReceivingConfiguration> {
    return this.http.put(`inbound/inbound-receiving-configuration`, inboundReceivingConfiguration).pipe(map(res => res.data));
  }

  changeInboundReceivingConfiguration(inboundReceivingConfiguration: InboundReceivingConfiguration): Observable<InboundReceivingConfiguration> {
    const url = `inbound/inbound-receiving-configuration/${inboundReceivingConfiguration.id}`;
    return this.http.post(url, inboundReceivingConfiguration).pipe(map(res => res.data));
  }

  removeInboundReceivingConfiguration(inboundReceivingConfiguration: InboundReceivingConfiguration): Observable<InboundReceivingConfiguration> {
    const url = `inbound/inbound-receiving-configuration/${inboundReceivingConfiguration.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
