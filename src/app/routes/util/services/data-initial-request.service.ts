import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { DataInitialRequest } from '../models/data-initial-request';

@Injectable({
  providedIn: 'root'
})
export class DataInitialRequestService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
  ) {}

  
  getDataInitialRequests(companyName?: string): Observable<DataInitialRequest[]> {
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec();

    let url = `admin/data/company/initiate`;
    if (companyName) {
      url = `${url}?companyName=${httpUrlEncodingCodec.encodeValue(companyName)}`;
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
