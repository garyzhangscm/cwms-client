import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { OperationType } from '../models/operation-type';
import { WorkTask } from '../models/work-task';
import { WorkTaskConfiguration } from '../models/work-task-configuration';

@Injectable({
  providedIn: 'root'
})
export class OperationTypeService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getOperationTypes(
    name?: string,
    description?: string): Observable<OperationType[]> { 
  
    const url = `resource/operation-types`;
      
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if(name) {
      params = params.append('name', name); 
    }
    if(description) {
      params = params.append('description', description); 
    } 
    return this.http
      .get(url, params)
      .pipe(map(res => res.data));

  }
  getOperationType(id: number): Observable<OperationType> {
    return this.http.get(`resource/operation-types/${  id}`).pipe(map(res => res.data));
  }

  addOperationType(operationType: OperationType): Observable<OperationType> {
    return this.http.put(`resource/operation-types?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, 
        operationType).pipe(map(res => res.data));
  }

  changeOperationType(operationType: OperationType): Observable<OperationType> {
    const url = `resource/operation-types/${  operationType.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.post(url, operationType).pipe(map(res => res.data));
  }

  removeOperationType(operationType: OperationType): Observable<OperationType> {
    const url = `resource/operation-types/${  operationType.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
   
}
