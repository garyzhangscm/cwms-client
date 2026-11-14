
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { SystemControlledNumber } from '../models/system-controlled-number';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class SystemControlledNumberService {
  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private utilService: UtilService
  ) {}

  
  getSystemControlledNumbers(variable?: string): Observable<SystemControlledNumber[]> {
     

    let url = `common/system-controlled-numbers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (variable) {
      url = `${url}&variable=${this.utilService.encodeValue(variable)}`;
    }
     
    
    return this.http.get(url).pipe(map(res => res.data));
  }
  getSystemControlledNumber(id: number): Observable<SystemControlledNumber> {
    return this.http.get(`common/system-controlled-numbers/${id}`).pipe(map(res => res.data));
  }

  addSystemControlledNumber(systemControlledNumber: SystemControlledNumber): Observable<SystemControlledNumber> {
    return this.http.put('common/system-controlled-numbers', systemControlledNumber).pipe(map(res => res.data));
  }
  changeSystemControlledNumber(systemControlledNumber: SystemControlledNumber): Observable<SystemControlledNumber> {
    return this.http.post(`common/system-controlled-numbers/${systemControlledNumber.id!}`, systemControlledNumber).pipe(map(res => res.data));
  }
 

  removeSystemControlledNumber(systemControlledNumber: SystemControlledNumber): Observable<SystemControlledNumber> {
    const url = `common/system-controlled-numbers/${systemControlledNumber.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  
  getNextAvailableId(type: string): Observable<string> {
    return this.http
      .get(`common/system-controlled-number/${type}/next?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data.nextNumber));
  }
}
