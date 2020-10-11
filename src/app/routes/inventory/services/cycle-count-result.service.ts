import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CycleCountResult } from '../models/cycle-count-result';
import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class CycleCountResultService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageService) {}

  getCycleCountResultDetails(batchId: string, refresh: boolean = false): Observable<CycleCountResult[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem(`inventory.cycle-count-result.${batchId}`);
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`inventory/cycle-count-result/${batchId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`inventory.cycle-count-result.${batchId}`, res)));
  }
}
