import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 

@Injectable({
  providedIn: 'root'
})
export class WalmartShippnigCartonLabelService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  generateWalmartShippingCartonLabels(SSCC18s : string): Observable<ReportHistory> {
    let url = `outbound/walmart-shipping-carton-labels/generate-label`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (SSCC18s) {
      params = params.append('SSCC18s', SSCC18s);  
    }
     

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
 
  uploadWalmartShippingCartonLabels(SSCC18s : string): Observable<ReportHistory> {
    let url = `outbound/walmart-shipping-carton-labels/generate-label`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);  
    if (SSCC18s) {
      params = params.append('SSCC18s', SSCC18s);  
    }
     

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  
}
