import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineMonitor } from '../models/production-line-monitor';

@Injectable({
  providedIn: 'root'
})
export class ProductionLineMonitorService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getProductionLineMonitors(name?: string, description?: string, productionLineName?: string): Observable<ProductionLineMonitor[]> {
    let url =  `workorder/production-line-monitors?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (name) {
      url = `${url}&name=${httpUrlEncodingCodec.encodeValue(name.trim())}`;
    }
    if (description) {
      url = `${url}&description=${httpUrlEncodingCodec.encodeValue(description.trim())}`;
    }
    if (productionLineName) {
      url = `${url}&productionLineName=${httpUrlEncodingCodec.encodeValue(productionLineName.trim())}`;
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
