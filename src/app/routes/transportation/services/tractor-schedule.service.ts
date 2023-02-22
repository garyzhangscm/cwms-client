
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Tractor } from '../models/tractor';
import { TractorSchedule } from '../models/tractor-schedule';
import { Trailer } from '../models/trailer';

@Injectable({
  providedIn: 'root'
})
export class TractorScheduleService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private utilService: UtilService,
    private companyService: CompanyService,
    private dateTimeService: DateTimeService,) { }

  getTractorSchedules(tractorId?: number, tractorNumber?: string,
    startCheckInTime?: Date, endCheckInTime?:Date,startDispatchTime?: Date, endDispatchTime?:Date,): Observable<TractorSchedule[]> {
    
    let url = `common/tractor-schedules?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;

    if (tractorId) {
      url = `${url}&tractorId=${tractorId}`;
    }
    if (tractorNumber) {
      url = `${url}&tractorNumber=${this.utilService.encodeValue(tractorNumber.trim())}`;
    }
    if (startCheckInTime) {
      url = `${url}&startCheckInTime=${this.dateTimeService.getISODateTimeString(startCheckInTime)}`;
    }
    if (endCheckInTime) {
      url = `${url}&endCheckInTime=${this.dateTimeService.getISODateTimeString(endCheckInTime)}`;
    }
    if (startDispatchTime) {
      url = `${url}&startDispatchTime=${this.dateTimeService.getISODateTimeString(startDispatchTime)}`;
    }
    if (endDispatchTime) {
      url = `${url}&endDispatchTime=${this.dateTimeService.getISODateTimeString(endDispatchTime)}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  

  getTractorSchedule(tractorScheduleId: number): Observable<TractorSchedule> { 

    return this.http
      .get(`common/tractor-schedules/${  tractorScheduleId}`)
      .pipe(map(res => res.data));
  }

  addTractorSchedule(tractorSchedule: TractorSchedule): Observable<TractorSchedule> {
    let url = `common/tractor-schedules?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
      
    return this.http.post(url, tractorSchedule).pipe(map(res => res.data));
  }

  changeTractorSchedule(tractorSchedule: TractorSchedule): Observable<TractorSchedule> {
    const url = `common/tractor-schedules/${  tractorSchedule.id}`;
    return this.http.put(url, tractorSchedule).pipe(map(res => res.data));
  }

  removeTractorSchedule(tractorSchedule: TractorSchedule): Observable<TractorSchedule> {
    const url = `common/tractor-schedules/${  tractorSchedule.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 
}
