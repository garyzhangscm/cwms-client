import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { InboundQcConfiguration } from '../models/inbound-qc-configuration';

@Injectable({
  providedIn: 'root'
})
export class InboundQcConfigurationService {

  constructor(private http: _HttpClient, private companyService: CompanyService) {}

  getInboundQcConfigurations(supplierId?: number, itemId?: number, itemName?: string, warehouseId?: number): Observable<InboundQcConfiguration[]> {
    let url = `inbound/inbound-qc-configuration?companyId=${this.companyService.getCurrentCompany()!.id}`;
    if (supplierId) {
      url = `${url}&supplierId=${supplierId}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }
    if (warehouseId) {
      url = `${url}&warehouseId=${warehouseId}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getInboundQcConfiguration(id: number): Observable<InboundQcConfiguration> {
    return this.http.get(`inbound/inbound-qc-configuration/${id}`).pipe(map(res => res.data));
  } 
 
  addInboundQcConfiguration(inboundQcConfiguration: InboundQcConfiguration): Observable<InboundQcConfiguration> {
    return this.http.put(`inbound/inbound-qc-configuration`, inboundQcConfiguration).pipe(map(res => res.data));
  }

  changeInboundQcConfiguration(inboundQcConfiguration: InboundQcConfiguration): Observable<InboundQcConfiguration> {
    const url = `inbound/inbound-qc-configuration/${inboundQcConfiguration.id}`;
    return this.http.post(url, inboundQcConfiguration).pipe(map(res => res.data));
  }

  removeInboundQcConfiguration(inboundQcConfiguration: InboundQcConfiguration): Observable<InboundQcConfiguration> {
    const url = `inbound/inbound-qc-configuration/${inboundQcConfiguration.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
