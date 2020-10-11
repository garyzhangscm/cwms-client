import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root',
})
export class SystemControlledNumberService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getNextAvailableId(type: string): Observable<string> {
    return this.http
      .get(`common/system-controlled-number/${type}/next?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data.nextNumber));
  }
}
