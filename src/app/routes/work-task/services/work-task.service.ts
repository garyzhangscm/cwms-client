import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { WorkTask } from '../models/work-task';

@Injectable({
  providedIn: 'root'
})
export class WorkTaskService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getWorkTasks(
    number?: string,
    type?: string,
    status?:string,
    sourceLocationName?: string,
    assignedUserName?: string,
    assignedRoleName?: string,): Observable<WorkTask[]> { 
  
    const url = `resource/work-tasks`;
      
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if(number) {
      params = params.append('number', number); 
    }
    if(type) {
      params = params.append('type', type); 
    }

    if(status) {
      params = params.append('status', status); 
    }

    if(sourceLocationName) {
      params = params.append('sourceLocationName', sourceLocationName); 
    }

    if(assignedUserName) {
      params = params.append('assignedUserName', assignedUserName); 
    }

    if(assignedRoleName) {
      params = params.append('assignedRoleName', assignedRoleName); 
    } 

    return this.http
      .get(url, params)
      .pipe(map(res => res.data));

  }
   
   
}
