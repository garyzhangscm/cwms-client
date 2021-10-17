import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
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
    private warehouseService: WarehouseService,) { }


  getProductionLineAssignment(productionLineAssignmentId: number): Observable<ProductionLineAssignment> {
      const url = `workorder/production-line-assignment/${productionLineAssignmentId}`;
      return this.http.get(url).pipe(map(res => res.data));
  }

  generateroductionLineAssignmentReport(productionLineAssignmentId: number): Observable<ReportHistory> {
    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/report`;
    return this.http.post(url).pipe(map(res => res.data));
  }

  
  generateroductionLineAssignmentLabel(productionLineAssignmentId: number): Observable<ReportHistory> {
    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/label`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
