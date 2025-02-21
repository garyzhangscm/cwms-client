import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QCRuleConfiguration } from '../models/qc-rule-configuration';

@Injectable({
  providedIn: 'root'
})
export class QcRuleConfigurationService {
  constructor(private http: _HttpClient, private warehosueService: WarehouseService) {}

  getQCRuleConfigurations(itemId?: number, itemName?: string,  itemFamilyId?: number,
        inventoryStatusId?: number, supplierId?: number): Observable<QCRuleConfiguration[]> {
    let url = `inventory/qc-rule-configuration?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
    if (itemFamilyId) {
      url = `${url}&itemFamilyId=${itemFamilyId}`;
    }
    if (itemId) {
      url = `${url}&itemId=${itemId}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }
    if (inventoryStatusId) {
      url = `${url}&inventoryStatusId=${inventoryStatusId}`;
    }
    if (supplierId) {
      url = `${url}&supplierId=${supplierId}`;
    }
    
    return this.http.get(url).pipe(map(res => res.data));
  }

  getQCRuleConfiguration(id: number): Observable<QCRuleConfiguration> {
    return this.http.get(`inventory/qc-rule-configuration/${id}`).pipe(map(res => res.data));
  } 
 
  addQCRuleConfiguration(qcRuleConfiguration: QCRuleConfiguration): Observable<QCRuleConfiguration> {
    return this.http.put(`inventory/qc-rule-configuration`, qcRuleConfiguration).pipe(map(res => res.data));
  }

  changeQCRuleConfiguration(qcRuleConfiguration: QCRuleConfiguration): Observable<QCRuleConfiguration> {
    const url = `inventory/qc-rule-configuration/${qcRuleConfiguration.id}`;
    return this.http.post(url, qcRuleConfiguration).pipe(map(res => res.data));
  }

  removeQCRuleConfiguration(qcRuleConfiguration: QCRuleConfiguration): Observable<QCRuleConfiguration> {
    const url = `inventory/qc-rule-configuration/${qcRuleConfiguration.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
