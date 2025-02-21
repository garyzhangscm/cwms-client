import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { WorkTask } from '../models/work-task';
import { WorkTaskConfiguration } from '../models/work-task-configuration';

@Injectable({
  providedIn: 'root'
})
export class WorkTaskConfigurationService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getWorkTaskConfigurations( 
    sourceLocationGroupTypeId?: number, sourceLocationGroupTypeName?: string,
    sourceLocationGroupId?: number, sourceLocationGroupName?: string,
    sourceLocationId?: number, sourceLocationName?: string,
    destinationLocationGroupTypeId?: number, destinationLocationGroupTypeName?: string,
    destinationLocationGroupId?: number, destinationLocationGroupName?: string,
    destinationLocationId?: number, destinationLocationName?: string,
    workTaskType?: string, operationTypeName?: string): Observable<WorkTaskConfiguration[]> { 
  
    const url = `resource/work-task-configurations`;
      
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
 
    if(sourceLocationGroupTypeId) {
      params = params.append('sourceLocationGroupTypeId', sourceLocationGroupTypeId); 
    }
    if(sourceLocationGroupTypeName) {
      params = params.append('sourceLocationGroupTypeName', sourceLocationGroupTypeName); 
    }
    if(sourceLocationGroupId) {
      params = params.append('sourceLocationGroupId', sourceLocationGroupId); 
    }
    if(sourceLocationGroupName) {
      params = params.append('sourceLocationGroupName', sourceLocationGroupName); 
    }
    if(sourceLocationId) {
      params = params.append('sourceLocationId', sourceLocationId); 
    }
    if(sourceLocationName) {
      params = params.append('sourceLocationName', sourceLocationName); 
    }
    if(destinationLocationGroupTypeId) {
      params = params.append('destinationLocationGroupTypeId', destinationLocationGroupTypeId); 
    }
    if(destinationLocationGroupTypeName) {
      params = params.append('destinationLocationGroupTypeName', destinationLocationGroupTypeName); 
    }
    if(destinationLocationGroupId) {
      params = params.append('destinationLocationGroupId', destinationLocationGroupId); 
    }
    if(destinationLocationGroupName) {
      params = params.append('destinationLocationGroupName', destinationLocationGroupName); 
    }
    if(destinationLocationId) {
      params = params.append('destinationLocationId', destinationLocationId); 
    }
    if(destinationLocationName) {
      params = params.append('destinationLocationName', destinationLocationName); 
    }
    if(workTaskType) {
      params = params.append('workTaskType', workTaskType); 
    }
    if(operationTypeName) {
      params = params.append('operationTypeName', operationTypeName); 
    }

    return this.http
      .get(url, params)
      .pipe(map(res => res.data));

  }
  getWorkTaskConfiguration(id: number): Observable<WorkTaskConfiguration> {
    return this.http.get(`resource/work-task-configurations/${  id}`).pipe(map(res => res.data));
  }

  addWorkTaskConfiguration(workTaskConfiguration: WorkTaskConfiguration): Observable<WorkTaskConfiguration> {
    return this.http.put(`resource/work-task-configurations?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`, 
        workTaskConfiguration).pipe(map(res => res.data));
  }

  changeWorkTaskConfiguration(workTaskConfiguration: WorkTaskConfiguration): Observable<WorkTaskConfiguration> {
    const url = `resource/work-task-configurations/${  workTaskConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.post(url, workTaskConfiguration).pipe(map(res => res.data));
  }

  removeWorkTaskConfiguration(workTaskConfiguration: WorkTaskConfiguration): Observable<WorkTaskConfiguration> {
    const url = `resource/work-task-configurations/${  workTaskConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
   
}
