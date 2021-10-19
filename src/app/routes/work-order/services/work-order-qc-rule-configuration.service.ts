import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderQcRuleConfiguration } from '../models/work-order-qc-rule-configuration';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderQcRuleConfigurationService {
  
  constructor(private http: _HttpClient, private warehosueService: WarehouseService) {}

  getQCRuleConfigurations(workOrderId?: number, 
                          workOrderNumber?: string,  
                          productionLineId?: number): Observable<WorkOrderQcRuleConfiguration[]> {
  let url = `workorder/qc-rule-configuration?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
  if (workOrderId) {
    url = `${url}&workOrderId=${workOrderId}`;
  }
  if (workOrderNumber) {
    url = `${url}&workOrderNumber=${workOrderNumber}`;
  }
  if (productionLineId) {
    url = `${url}&productionLineId=${productionLineId}`;
  }
  

  return this.http.get(url).pipe(map(res => res.data));
  }

  getQCRuleConfiguration(id: number): Observable<WorkOrderQcRuleConfiguration> {
    return this.http.get(`workorder/qc-rule-configuration/${id}`).pipe(map(res => res.data));
  } 

  addQCRuleConfiguration(qcRuleConfiguration: WorkOrderQcRuleConfiguration): Observable<WorkOrderQcRuleConfiguration> {
    return this.http.put(`workorder/qc-rule-configuration`, qcRuleConfiguration).pipe(map(res => res.data));
  }

  changeQCRuleConfiguration(qcRuleConfiguration: WorkOrderQcRuleConfiguration): Observable<WorkOrderQcRuleConfiguration> {
    const url = `workorder/qc-rule-configuration/${qcRuleConfiguration.id}`;
    return this.http.post(url, qcRuleConfiguration).pipe(map(res => res.data));
  }

  removeQCRuleConfiguration(qcRuleConfiguration: WorkOrderQcRuleConfiguration): Observable<WorkOrderQcRuleConfiguration> {
    const url = `workorder/qc-rule-configuration/${qcRuleConfiguration.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
