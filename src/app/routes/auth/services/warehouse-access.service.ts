import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WarehouseAccess } from '../models/warehouse-access';

@Injectable({
  providedIn: 'root'
})
export class WarehouseAccessService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, ) {}

  
  getAccesses(username?: string, userId?: number, ): Observable<WarehouseAccess[]> {
    const url = `resource/warehouse-access`;
    
    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);
    if (username) {
      params = params.append('username', username);
    } 
    if (userId) {
      params = params.append('userId', userId);
    } 
     

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getAccess(id: number): Observable<WarehouseAccess> {
    return this.http.get(`resource/warehouse-access/${id}`).pipe(map(res => res.data));
  }

  hasAccess(warehouseId: number, userId: number): Observable<WarehouseAccess> {
    
    const url = `resource/warehouse-access/has-access`;
    
    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);
    params = params.append('userId', userId); 
     

    return this.http.get(url, params).pipe(map(res => res.data));

  }
  
  addAccess(warehouseAccess: WarehouseAccess): Observable<WarehouseAccess> {
    
    const url = `resource/warehouse-access`;
    
    let params = new HttpParams();
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
     

    return this.http.put(url, warehouseAccess, params).pipe(map(res => res.data));

  }

  removeAccess(userId: number, warehouseId: number): Observable<String> {
    
    const url = `resource/warehouse-access`;
    
    let params = new HttpParams();
    params = params.append('warehouseId', warehouseId); 
    params = params.append('userId', userId); 
     

    return this.http.delete(url, params).pipe(map(res => res.data));

  }
}
