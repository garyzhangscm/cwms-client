import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Silo } from '../models/silo';
import { SiloDevice } from '../models/silo-device';

@Injectable({
  providedIn: 'root'
})
export class SiloService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getSiloDevices(): Observable<SiloDevice[]> {

    
    let params = new HttpParams();
     
    const url = `workorder/silo-devices`
    // const token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwaG9uZSI6NDc5MzA1MjU2NiwidXNlcl9pZCI6ODQzLCJ2aWV3IjoiIiwiZXhwIjoxLjY3NTgyMjU3OUU5LCJlbWFpbCI6InBhdWxoYXJwZXJAZWNvdGVjaGludGwuY29tIiwidXNlcm5hbWUiOiJwYXVsLmhhcnBlciIsInR5cGUiOiJEIn0.LXZS9niF98NKjxxfPOpHFYtvq9l8bwS1ra8ZbAZKP_k`
    
    params = params.append(`warehouseId`, this.warehouseService.getCurrentWarehouse().id);  
    params = params.append(`refresh`, true); 
    // params = params.append(`token`, token);  
    // `&searchString=&group_id=&location_id=&device_id=&hasAlert=`;
    
     
    return this.http.get(url, params).pipe(map(res => res.data));
  }
}
