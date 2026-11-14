import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SystemControlledNumberService } from '../../util/services/system-controlled-number.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { CycleCountBatch } from '../models/cycle-count-batch';

@Injectable({
  providedIn: 'root',
})
export class CycleCountBatchService {
  constructor(private http: _HttpClient,     
    private warehouseService: WarehouseService,
    private systemControlledNumberService: SystemControlledNumberService) {}

  getCycleCountBatches(batchId?: string): Observable<CycleCountBatch[]> {
    let url = `inventory/cycle-count-batches?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (batchId) {
      url = `${url}&batchId=${batchId}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getNextCycleCountBatchId(): Observable<string> {
    return this.systemControlledNumberService.getNextAvailableId('cycle-count-batch-id');
  }
}
