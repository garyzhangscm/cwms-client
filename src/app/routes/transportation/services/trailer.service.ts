
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { Trailer } from '../models/trailer';
import { TrailerAppointment } from '../models/trailer-appointment';

@Injectable({
  providedIn: 'root'
})
export class TrailerService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private utilService: UtilService,
    private companyService: CompanyService,) { }

  getTrailers(number?: string): Observable<Trailer[]> {
    
    let url = `common/trailers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
 
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  
  getOpenTrailersForTractor(number?: string): Observable<Trailer[]> {
    
    let url = `common/trailers/open-for-tractor?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
 
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  

  getTrailer(trailerId: number): Observable<Trailer> { 

    return this.http
      .get(`common/trailers/${  trailerId}`)
      .pipe(map(res => res.data));
  }

  addTrailer(trailer: Trailer): Observable<Trailer> {
    return this.http.post('common/trailers', trailer).pipe(map(res => res.data));
  }

  changeTrailer(trailer: Trailer): Observable<Trailer> {
    const url = `common/trailers/${  trailer.id}`;
    return this.http.put(url, trailer).pipe(map(res => res.data));
  }

  removeTrailer(trailer: Trailer): Observable<Trailer> {
    const url = `common/trailers/${  trailer.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 

  getTrailerCurrentAppointment(trailerId: number): Observable<TrailerAppointment> {
    const url = `common/trailers/${trailerId}/current-appointment`;
    return this.http.get(url).pipe(map(res => res.data));
  } 
  addTrailerAppointment(trailerId: number, trailerAppointment: TrailerAppointment): Observable<TrailerAppointment> {
    const url = `common/trailers/${trailerId}/add-appointment`;
    return this.http.put(url, trailerAppointment).pipe(map(res => res.data));
  } 
  cancelTrailerAppointment(trailerId: number, trailerAppointmentId: number): Observable<TrailerAppointment> {
    const url = `common/trailers/${trailerId}/appointments/${trailerAppointmentId}/cancel`;
    return this.http.post(url).pipe(map(res => res.data));
  } 
  completeTrailerAppointment(trailerId: number, trailerAppointmentId: number): Observable<TrailerAppointment> {
    const url = `common/trailers/${trailerId}/appointments/${trailerAppointmentId}/complete`;
    return this.http.post(url).pipe(map(res => res.data));
  } 
  removeTrailerAppointment(trailerId: number, trailerAppointment: TrailerAppointment): Observable<TrailerAppointment> {
    const url = `common/trailers/${trailerId}/appointment/${trailerAppointment.id}`;
    return this.http.delete(url, trailerAppointment).pipe(map(res => res.data));
  } 
  
  assignStopShipmentOrdersToTrailerAppointment(
    trailerAppointmentId: number, stopIdList?: string, shipmentIdList?: string, orderIdList?: string
  ) : Observable<TrailerAppointment> {
    let url = `outbound/trailer-appointments/${trailerAppointmentId}/assign-stops-shipments-orders?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
    
    if (stopIdList) {
      url = `${url}&stopIdList=${stopIdList}`;
    }
    if (shipmentIdList) {
      url = `${url}&shipmentIdList=${shipmentIdList}`;
    }
    if (orderIdList) {
      url = `${url}&orderIdList=${orderIdList}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  } 
  
}
