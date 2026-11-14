
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineMonitor } from '../models/production-line-monitor';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineMonitorService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private utilService: UtilService) {}

  getProductionLineMonitors(name?: string, description?: string, productionLineName?: string): Observable<ProductionLineMonitor[]> {
    let url =  `workorder/production-line-monitors?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
     
    if (name) {
      url = `${url}&name=${this.utilService.encodeValue(name.trim())}`;
    }
    if (description) {
      url = `${url}&description=${this.utilService.encodeValue(description.trim())}`;
    }
    if (productionLineName) {
      url = `${url}&productionLineName=${this.utilService.encodeValue(productionLineName.trim())}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }  
  getProductionLineMonitor(id: number): Observable<ProductionLineMonitor> {
    return this.http.get(`workorder/production-line-monitors/${id}`).pipe(map(res => res.data));
  }

  addProductionLineMonitor(productionLineMonitor: ProductionLineMonitor): Observable<ProductionLineMonitor> {
    return this.http.put(`workorder/production-line-monitors`, productionLineMonitor).pipe(map(res => res.data));
  }

  changeProductionLineMonitor(productionLineMonitor: ProductionLineMonitor): Observable<ProductionLineMonitor> {
    const url = `workorder/production-line-monitors/${productionLineMonitor.id}`;
    return this.http.post(url, productionLineMonitor).pipe(map(res => res.data));
  }

  removeProductionLineMonitor(productionLineMonitor: ProductionLineMonitor): Observable<ProductionLineMonitor> {
    const url = `workorder/production-line-monitors/${productionLineMonitor.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
   
}
