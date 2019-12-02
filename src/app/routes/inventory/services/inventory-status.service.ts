import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { InventoryStatus } from '../models/inventory-status';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InventoryStatusService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}

  loadInventoryStatuses(refresh: boolean = false): Observable<InventoryStatus[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('inventory.InventoryStatuses');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get('inventory/inventory-statuses')
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('inventory.InventoryStatuses', res)));
  }
}
