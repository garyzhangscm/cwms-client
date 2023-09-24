import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { map, Observable } from 'rxjs';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LightStatus } from '../models/light-status';
import { Machine } from '../models/machine';
import { ProductionLineType } from '../models/production-line-type';

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
  
  getCurrentShiftMachineStatus(machineNo?: string, productionLineTypeName?: string): Observable<Machine[]> { 
    
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    if (machineNo) {

      params = params.append('machineNo', machineNo); 
    }
    if (productionLineTypeName) {

      params = params.append('type', productionLineTypeName); 
    }

    return this.http
      .get(`workorder/light-mes/machine-status/current-shift`, params)
      .pipe(map(res => res.data));

  }
}
