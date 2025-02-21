
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DateTimeService } from '../../util/services/date-time.service';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { TrailerAppointment } from '../models/trailer-appointment';
import { TrailerAppointmentStatus } from '../models/trailer-appointment-status.enum';
import { TrailerAppointmentType } from '../models/trailer-appointment-type.enum'; 

@Injectable({
  providedIn: 'root'
})
export class TrailerAppointmentService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,   
    private utilService: UtilService,
    private dateTimeService: DateTimeService,
  ) {}
 
  
  getTrailerAppointments(number?: string, type?: TrailerAppointmentType, 
    status?: TrailerAppointmentStatus, startTime?: Date, endTime?:Date, date?: Date,
     ): Observable<TrailerAppointment[]> {
    
    let url = `common/trailer-appointments?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
 
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    if (type) {
      url = `${url}&type=${type}`;
    }
    if (status) {
      url = `${url}&status=${status}`;
    }
    if (startTime) {
      url = `${url}&startTime=${this.dateTimeService.getISODateTimeString(startTime)}`;
    }
    if (endTime) {
      url = `${url}&endTime=${this.dateTimeService.getISODateTimeString(endTime)}`;
    }
    if (date) {
      url = `${url}&date=${this.dateTimeService.getISODateString(date)}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }

  getTrailerAppointment(id: number): Observable<TrailerAppointment> { 

    return this.http
      .get(`common/trailer-appointments/${  id}`)
      .pipe(map(res => res.data));
  }
  completeTrailerAppointment(id: number): Observable<TrailerAppointment> { 

    return this.http
      .post(`common/trailer-appointments/${id}/complete?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));
  }
  completeLoad(id: number): Observable<TrailerAppointment> { 

    return this.http
      .post(`outbound/trailer-appointments/${id}/complete?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));
  }
  allocateTrailerAppointment(id: number): Observable<TrailerAppointment> { 

    return this.http
      .post(`outbound/trailer-appointments/${id}/allocate?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));
  }
}
