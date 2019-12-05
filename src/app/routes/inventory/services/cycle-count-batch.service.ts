import { Injectable } from '@angular/core';
import { CycleCountBatch } from '../models/cycle-count-batch';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SystemControlledNumberService } from '../../common/services/system-controlled-number.service';

@Injectable({
  providedIn: 'root',
})
export class CycleCountBatchService {
  constructor(private http: _HttpClient, private systemControlledNumberService: SystemControlledNumberService) {}

  getCycleCountBatches(batchId?: string): Observable<CycleCountBatch[]> {
    let params = '';
    if (batchId) {
      params = `batchId=${batchId}`;
    }

    const url = 'inventory/cycle-count-batches' + (params.length > 0 ? '?' + params : '');
    return this.http.get(url).pipe(map(res => res.data));
  }

  getNextCycleCountBatchId(): Observable<string> {
    return this.systemControlledNumberService.getNextAvailableId('cycle-count-batch-id');
  }
}
