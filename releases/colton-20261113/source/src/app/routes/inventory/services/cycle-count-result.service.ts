import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CycleCountResult } from '../models/cycle-count-result';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class CycleCountResultService {
  constructor(private http: _HttpClient, 
    private localStorageService: LocalStorageService, 
    
    private warehouseService: WarehouseService,) {}

  getCycleCountResultDetails(batchId: string, refresh: boolean = false): Observable<CycleCountResult[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(`inventory.cycle-count-result.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-result/${this.warehouseService.getCurrentWarehouse().id}/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`inventory.cycle-count-result.${batchId}`, res)));
  }
}
