import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MasterProductionSchedule } from '../models/master-production-schedule';

@Injectable({
  providedIn: 'root'
})
export class MasterProductionScheduleService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getMasterProductionSchedules(number?: string, description?: string): Observable<MasterProductionSchedule[]> {
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    
    let url = `workorder/master-production-schedules?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    if (description) {
      url = `${url}&description=${httpUrlEncodingCodec.encodeValue(description.trim())}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getMasterProductionSchedule(id: number): Observable<MasterProductionSchedule> {
    return this.http.get(`workorder/master-production-schedules/${id}`).pipe(map(res => res.data));
  } 
 
  addMasterProductionSchedule(masterProductionSchedule: MasterProductionSchedule): Observable<MasterProductionSchedule> {
    return this.http.put(`workorder/master-production-schedules`, masterProductionSchedule).pipe(map(res => res.data));
  }

  changeMasterProductionSchedule(masterProductionSchedule: MasterProductionSchedule): Observable<MasterProductionSchedule> {
    const url = `workorder/master-production-schedules/${masterProductionSchedule.id}`;
    return this.http.put(url, masterProductionSchedule).pipe(map(res => res.data));
  }

  removeMasterProductionSchedule(masterProductionSchedule: MasterProductionSchedule): Observable<MasterProductionSchedule> {
    const url = `workorder/master-production-schedules/${masterProductionSchedule.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  
  getAvailableDate(productionLineId: number, beginDate: Date, endDate: Date): Observable<Date[]> {
    let url = `workorder/master-production-schedules/available-date?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    url = `${url}&productionLineId=${productionLineId}`;
    url = `${url}&beginDate=${beginDate}`;
    url = `${url}&endDate=${endDate}`;
    return this.http.get(url).pipe(map(res => res.data));
  }
}
