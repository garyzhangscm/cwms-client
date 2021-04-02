import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme/src/services/http/http.client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Report } from '../models/report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAll(
    name?: string,
    companySpecific?: boolean,
    warehouseSpecific?: boolean,
  ): Observable<Report[]> {
    let url = `resource/reports?`; 
    
    if (name) {
      url = `${url}&name=${name}`;
    }
    if (companySpecific) {
      url = `${url}&companyId=${this.warehouseService.getCurrentWarehouse().companyId.toString()}`; 
    }
    if (warehouseSpecific) {
      url = `${url}&warehouseId=${this.warehouseService.getCurrentWarehouse().id.toString()}`; 
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
}
