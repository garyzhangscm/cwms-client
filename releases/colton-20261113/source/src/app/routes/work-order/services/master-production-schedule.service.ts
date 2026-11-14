
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GanttTask } from '../../util/models/gantt-task';
import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MasterProductionSchedule } from '../models/master-production-schedule';

@Injectable({
  providedIn: 'root'
})
export class MasterProductionScheduleService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private dateTimeService: DateTimeService, 
    private utilService: UtilService) {}

  getMasterProductionSchedules(number?: string, description?: string, productionLineId?: number,
     productionLineIds?: string, itemName?:string,     
    beginDateTime?: Date,
    endDateTime?: Date, ): Observable<MasterProductionSchedule[]> { 
    
    let url = `workorder/master-production-schedules?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    if (description) {
      url = `${url}&description=${this.utilService.encodeValue(description.trim())}`;
    }

    if (productionLineId) {
      url = `${url}&productionLineId=${productionLineId}`;
    }
    if (productionLineIds) {
      url = `${url}&productionLineIds=${productionLineIds}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }
    if (beginDateTime) {
      url = `${url}&beginDateTime=${this.dateTimeService.getISODateTimeString(beginDateTime)}`;
    }
    if (endDateTime) {
      url = `${url}&endDateTime=${this.dateTimeService.getISODateTimeString(endDateTime)}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getMasterProductionSchedule(id: number): Observable<MasterProductionSchedule> {
    return this.http.get(`workorder/master-production-schedules/${id}`).pipe(map(res => res.data));
  } 
 
  addMasterProductionSchedule(masterProductionSchedule: MasterProductionSchedule): Observable<MasterProductionSchedule> {
    return this.http.put(`workorder/master-production-schedules`, masterProductionSchedule).pipe(map(res => res.data));
  }

  changeMasterProductionSchedule(masterProductionSchedule: MasterProductionSchedule, moveSuccessor: boolean): Observable<MasterProductionSchedule> {
    const url = `workorder/master-production-schedules/${masterProductionSchedule.id}?moveSuccessor=${moveSuccessor}`;
    return this.http.post(url, masterProductionSchedule).pipe(map(res => res.data));
  }

  removeMasterProductionSchedule(masterProductionSchedule: MasterProductionSchedule, moveSuccessor: boolean): Observable<MasterProductionSchedule> {
    const url = `workorder/master-production-schedules/${masterProductionSchedule.id}?moveSuccessor=${moveSuccessor}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  
  getAvailableDate(productionLineId: number, beginDate: Date, endDate: Date): Observable<Date[]> {
    let url = `workorder/master-production-schedules/available-date?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    url = `${url}&productionLineId=${productionLineId}`;
    url = `${url}&beginDate=${beginDate}`;
    url = `${url}&endDate=${endDate}`;
    return this.http.get(url).pipe(map(res => res.data));
  }

  
  getExistingMPSs(productionLineId: number, beginDate: Date, endDate: Date): Observable<MasterProductionSchedule[]> {
    let url = `workorder/master-production-schedules/existing-mps`;

    
    let params = new HttpParams();
    
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);   
    params = params.append('productionLineId', productionLineId);   
    params = params.append('beginDateTime', this.dateTimeService.getISODateTimeString(beginDate));   
    params = params.append('endDateTime',this.dateTimeService.getISODateTimeString(endDate));   
 
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getMPSsGanttView(): Promise<GanttTask[]>{
      return Promise.resolve([
          {id: 1, text: "M1", start_date: "2022-01-15 00:00", duration: 30, progress: 1},
          {id: 2, text: "HT-BLK-4SH22-Pannel", start_date: "2022-01-15 00:00", duration: 20, progress: 1, parent: 1},
          {id: 3, text: "HT-BLK-4SH22-Pannel", start_date: "2022-01-15 00:00", duration: 5, progress: 1, parent: 2},
          {id: 4, text: "HT-BLK-4SH22-Pannel", start_date: "2022-01-25 00:00", duration: 10, progress: 1, parent: 2}
      ]);
  }
}
