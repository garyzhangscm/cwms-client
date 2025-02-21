
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyService } from '../../warehouse-layout/services/company.service';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { DataInitialRequest } from '../models/data-initial-request';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class DataInitialRequestService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private utilService: UtilService, 
    private companyService: CompanyService,
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
    const url = `admin/data/company/initiate`;
    
    let params = new HttpParams(); 
    params = params.append('newCompanyName', companyName); 
    params = params.append('newWarehouseName', warehouseName); 
    params = params.append('adminUsername', adminUsername); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    
    return this.http.put(url, undefined, params).pipe(map(res => res.data));
  }
 
}
