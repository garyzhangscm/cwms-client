import { HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { locale } from 'moment-timezone';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineAssignment } from '../models/production-line-assignment';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineAssignmentService {

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { }


  getProductionLineAssignments(productionLineId?: number, productionLineIds?: string): Observable<ProductionLineAssignment[]> {
    let url = `workorder/production-line-assignments?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    if (productionLineId) {
      url = `${url}&productionLineId=${productionLineId}`;
    }
    if (productionLineIds) {
      url = `${url}&productionLineIds=${productionLineIds}`;
    } 
    return this.http.get(url).pipe(map(res => res.data));
  }

  getProductionLineAssignment(productionLineAssignmentId: number, 
    includeDetails?: boolean,): Observable<ProductionLineAssignment> {
      let url = `workorder/production-line-assignment/${productionLineAssignmentId}`;

      if (includeDetails !== undefined && includeDetails !== null) {
  
        url = `${url}?includeDetails=${includeDetails}`;
      }
      return this.http.get(url).pipe(map(res => res.data));
  }

  generateroductionLineAssignmentReport(productionLineAssignmentId: number, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();
    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);
    
    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/report`;
    return this.http.post(url, null, params).pipe(map(res => res.data));
  }

  
  generateroductionLineAssignmentLabel(productionLineAssignmentId: number, locale?: string): Observable<ReportHistory> {
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);

    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/label`;
    return this.http.post(url, null, params).pipe(map(res => res.data));
  }
}
