
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { DataInitialRequest } from '../models/data-initial-request';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class DataInitialRequestService {
  constructor(
    private http: _HttpClient, 
    private utilService: UtilService,
  ) {}

  
  getDataInitialRequests(companyName?: string): Observable<DataInitialRequest[]> {
     
    let url = `admin/data/company/initiate`;
    if (companyName) {
      url = `${url}?companyName=${this.utilService.encodeValue(companyName)}`;
    }
     
    
    return this.http.get(url).pipe(map(res => res.data));
  }
  getDataInitialRequest(id: number): Observable<DataInitialRequest> {
    return this.http.get(`admin/data/company/initiate/${id}`).pipe(map(res => res.data));
  }

  addDataInitialRequest(companyName: string, warehouseName: string, adminUsername: string): Observable<DataInitialRequest> {
    const url = `admin/data/company/initiate?companyName=${companyName}&warehouseName=${warehouseName}&adminUsername=${adminUsername}`
    return this.http.put(url).pipe(map(res => res.data));
  }
 
}
