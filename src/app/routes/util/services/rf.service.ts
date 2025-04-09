
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { RF } from '../models/rf';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class RfService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private utilService: UtilService
  ) {}

  
  getRFs(rfCode?: string): Observable<RF[]> {
     

    let url = `resource/rfs?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (rfCode) {
      url = `${url}&rfCode=${this.utilService.encodeValue(rfCode)}`;
    }
     
    
    return this.http.get(url).pipe(map(res => res.data));
  }
  getRF(id: number): Observable<RF> {
    return this.http.get(`resource/rfs/${id}`).pipe(map(res => res.data));
  }

  addRf(rf: RF): Observable<RF> {
    return this.http.put('resource/rfs', rf).pipe(map(res => res.data));
  }
 

  removeRf(rf: RF): Observable<RF> {
    const url = `resource/rfs/${rf.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  // get work station id
  // right now we will use the same RF data
  getLoginRF() {
    return  localStorage.getItem('work_station_name');
  }
  setLoginRF(name: string) {
    return  localStorage.setItem('work_station_name', name);
  }
}
