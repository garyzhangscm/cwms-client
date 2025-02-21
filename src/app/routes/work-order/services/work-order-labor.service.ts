import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderLabor } from '../models/work-order-labor';
import { WorkOrderLaborStatus } from '../models/work-order-labor-status';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderLaborService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkOrderLabors(productionLineId?: number, workOrderLaborStatus?: WorkOrderLaborStatus, 
    username?: string): Observable<WorkOrderLabor[]> {
    let url = `workorder/labors?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (productionLineId) {
      url = `${url}&productionLineId=${productionLineId}`;
    }
    if (workOrderLaborStatus) {
      url = `${url}&workOrderLaborStatus=${workOrderLaborStatus}`;
    }
    if (username) {
      url = `${url}&username=${username}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  
}
