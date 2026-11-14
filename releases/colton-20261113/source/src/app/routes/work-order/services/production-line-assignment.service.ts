import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineAssignment } from '../models/production-line-assignment';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineAssignmentService {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,) { }


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

  generateProductionLineAssignmentReport(productionLineAssignmentId: number, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();
    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);
    
    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/report`;
    return this.http.post(url, null, params).pipe(map(res => res.data));
  }
  generateWorkOrderManualPickSheet(productionLineAssignmentId: number, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();
    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);
    
    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/manual-pick-sheet`;
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
