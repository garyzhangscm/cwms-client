import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { map, Observable } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LightStatus } from '../models/light-status';
import { Machine } from '../models/machine';

@Injectable({
  providedIn: 'root'
})
export class LightMesService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

    
    getMachineList(): Observable<Machine[]> { 
  
    return this.http
      .get(`workorder/light-mes/machine-list?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
    
  getSingleLightStatus(sim: string): Observable<LightStatus[]> { 
    
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('sim', sim); 

    return this.http
      .get(`workorder/light-mes/light-status/single`, params)
      .pipe(map(res => res.data));

  }
}
