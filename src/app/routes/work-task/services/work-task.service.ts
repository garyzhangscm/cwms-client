import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkStatus } from '../models/work-status.enum';
import { WorkTask } from '../models/work-task';
import { WorkType } from '../models/work-type.enum';

@Injectable({
  providedIn: 'root',
})
export class WorkTaskService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkTasks(
    number?: string,
    workType?: WorkType,
    workStatus?: WorkStatus,
    lpn?: string,
    sourceLocationName?: string,
    destinationLocationName?: string,
    assignedUserName?: string,
    assignedRoleName?: string,
    assignedWorkingTeamName?: string,
    currentUserName?: string,
    completeUserName?: string,
  ): Observable<WorkTask[]> {
    let url = `common/work-tasks?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }
    if (workType) {
      url = `${url}&workType=${workType}`;
    }
    if (workStatus) {
      url = `${url}&workStatus=${workStatus}`;
    }

    if (lpn) {
      url = `${url}&lpn=${lpn}`;
    }
    if (sourceLocationName) {
      url = `${url}&sourceLocationName=${sourceLocationName}`;
    }
    if (destinationLocationName) {
      url = `${url}&destinationLocationName=${destinationLocationName}`;
    }
    if (assignedUserName) {
      url = `${url}&assignedUserName=${assignedUserName}`;
    }
    if (assignedRoleName) {
      url = `${url}&assignedRoleName=${assignedRoleName}`;
    }
    if (assignedWorkingTeamName) {
      url = `${url}&assignedWorkingTeamName=${assignedWorkingTeamName}`;
    }
    if (currentUserName) {
      url = `${url}&currentUserName=${currentUserName}`;
    }
    if (completeUserName) {
      url = `${url}&completeUserName=${completeUserName}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getWorkTask(id: number): Observable<WorkTask> {
    return this.http.get('common/work-tasks/' + id).pipe(map(res => res.data));
  }

  addWorkTask(workTask: WorkTask): Observable<WorkTask> {
    return this.http.post('common/work-tasks/', workTask).pipe(map(res => res.data));
  }

  changeWorkTask(workTask: WorkTask): Observable<WorkTask> {
    const url = 'common/work-tasks/' + workTask.id;
    return this.http.post(url, workTask).pipe(map(res => res.data));
  }

  removeWorkTask(workTask: WorkTask): Observable<WorkTask> {
    const url = 'common/work-tasks/' + workTask.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  assignWorkTasks(
    workTasks: WorkTask[],
    username?: string,
    rolename?: string,
    workingTeamName?: string,
  ): Observable<WorkTask[]> {
    let params = new HttpParams();

    const workTaskIds: number[] = [];
    workTasks.forEach(workTask => {
      workTaskIds.push(workTask.id);
    });
    params = params.append('workTaskIds', workTaskIds.join(','));

    if (username) {
      params = params.append('username', username);
    }
    if (rolename) {
      params = params.append('rolename', rolename);
    }
    if (workingTeamName) {
      params = params.append('workingTeamName', workingTeamName);
    }
    return this.http.post('common/work-tasks/assignment', params).pipe(map(res => res.data));
  }

  deassignWorkTasks(workTasks: WorkTask[]): Observable<WorkTask[]> {
    let params = new HttpParams();

    const workTaskIds: number[] = [];
    workTasks.forEach(workTask => {
      workTaskIds.push(workTask.id);
    });
    params = params.append('workTaskIds', workTaskIds.join(','));

    return this.http.post('common/work-tasks/deassignment', params).pipe(map(res => res.data));
  }
}
