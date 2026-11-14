import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of, map, tap } from 'rxjs';

import { LocalStorageService } from '../../util/services/LocalStorageService';


import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillableActivityType } from '../models/billable-activity-type';

@Injectable({
  providedIn: 'root'
})
export class BillableActivityTypeService {
  
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService, 
    private utilService: UtilService,
  ) {}

  loadBillableActivityTypes(refresh: boolean = true): Observable<BillableActivityType[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem(`billing.billable-activity-types.${this.warehouseService.getCurrentWarehouse().id}`);
      if (data !== null) {
        return of(data);
      }
    }

    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    
    return this.http
      .get(`admin/billable-activity-types`, params)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(
        `billing.billable-activity-types.${this.warehouseService.getCurrentWarehouse().id}`, res)));
  }
  
  getBillableActivityTypes(name?: string, description?: string): Observable<BillableActivityType[]> {
    
    const url = `admin/billable-activity-types`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    if (name) {      
        params = params.append('name', name.trim()); 
    }
    if (description) {      
        params = params.append('description', description.trim()); 
    }
    
    return this.http
      .get(url, params)
      .pipe(map(res => res.data));
  }
  getBillableActivityType(id: number): Observable<BillableActivityType> {
    

    return this.http
      .get(`admin/billable-activity-types/${id}`)
      .pipe(map(res => res.data));
  }

  addBillableActivityType(billableActivityType: BillableActivityType): Observable<BillableActivityType> {
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    return this.http.put('admin/billable-activity-types', billableActivityType, params).pipe(map(res => res.data));
  }

  changeBillableActivityType(billableActivityType: BillableActivityType): Observable<BillableActivityType> {
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    const url = `admin/billable-activity-types/${  billableActivityType.id}`;
    return this.http.post(url, billableActivityType, params).pipe(map(res => res.data));
  }

  removeBillableActivityType(billableActivityType: BillableActivityType): Observable<BillableActivityType> {
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    const url = `admin/billable-activity-types/${  billableActivityType.id}`;
    return this.http.delete(url, params).pipe(map(res => res.data));
  } 
}
