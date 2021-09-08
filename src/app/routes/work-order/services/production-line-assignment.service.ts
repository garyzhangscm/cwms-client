import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineAssignmentService {

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,) { }


  generateroductionLineAssignmentReport(productionLineAssignmentId: number): Observable<ReportHistory> {
    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/report`;
    return this.http.post(url).pipe(map(res => res.data));
  }

  
  generateroductionLineAssignmentLabel(productionLineAssignmentId: number): Observable<ReportHistory> {
    const url = `workorder/production-line-assignments/${productionLineAssignmentId}/label`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
