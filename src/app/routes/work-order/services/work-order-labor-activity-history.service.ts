import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderLaborActivityHistory } from '../models/work-order-labor-activity-history';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderLaborActivityHistoryService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkOrderLabors(productionLineId?: number, 
    username?: string): Observable<WorkOrderLaborActivityHistory[]> {
    let url = `workorder/labor-activity-history?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (productionLineId) {
      url = `${url}&productionLineId=${productionLineId}`;
    } 
    if (username) {
      url = `${url}&username=${username}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

}
