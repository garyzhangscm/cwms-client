import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcConfiguration } from '../models/qc-configuration';

@Injectable({
  providedIn: 'root'
})
export class QcConfigurationService {
  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService) { }

  getQcConfiguration(): Observable<QcConfiguration> {
    let url = `inventory/qc-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse()!.id}`;

    return this.http.get(url).pipe(map(res => res.data));


  }
  saveQcConfiguration(systemConfiguration: QcConfiguration): Observable<QcConfiguration> {
    let url = `inventory/qc-configuration`;

    return this.http.put(url, systemConfiguration).pipe(map(res => res.data));


  }

}
