import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QCRule } from '../models/qc-rule';

@Injectable({
  providedIn: 'root'
})
export class QcRuleService {
  constructor(private http: _HttpClient, private warehosueService: WarehouseService) {}

  getQCRules(name?: string): Observable<QCRule[]> {
    let url = `inventory/qc-rules?warehouseId=${this.warehosueService.getCurrentWarehouse()!.id}`;
    if (name) {
      url = `${url}&name=${name}`;
    }
    
    return this.http.get(url).pipe(map(res => res.data));
  }

  getQCRule(id: number): Observable<QCRule> {
    return this.http.get(`inventory/qc-rules/${id}`).pipe(map(res => res.data));
  } 
 
  addQCRule(qcRule: QCRule): Observable<QCRule> {
    return this.http.put(`inventory/qc-rules`, qcRule).pipe(map(res => res.data));
  }

  changeQCRule(qcRule: QCRule): Observable<QCRule> {
    const url = `inventory/qc-rules/${qcRule.id}`;
    return this.http.post(url, qcRule).pipe(map(res => res.data));
  }

  removeQCRule(qcRule: QCRule): Observable<QCRule> {
    const url = `inventory/qc-rules/${qcRule.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
