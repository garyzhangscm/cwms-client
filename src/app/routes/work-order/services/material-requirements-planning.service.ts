import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { MaterialRequirementsPlanning } from '../models/material-requirements-planning';

@Injectable({
  providedIn: 'root'
})
export class MaterialRequirementsPlanningService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getMRPs(number?: string, description?: string, mpsNumber?: string): Observable<MaterialRequirementsPlanning[]> {
    let url = `workorder/material-requirements-planning?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    if (description) {
      url = `${url}&description=${httpUrlEncodingCodec.encodeValue(description.trim())}`;
    }
    if (mpsNumber) {
      url = `${url}&mpsNumber=${httpUrlEncodingCodec.encodeValue(mpsNumber.trim())}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getMRP(id: number): Observable<MaterialRequirementsPlanning> {
    return this.http.get(`workorder/material-requirements-planning/${id}`).pipe(map(res => res.data));
  } 
 
  addMRP(mrp: MaterialRequirementsPlanning): Observable<MaterialRequirementsPlanning> {
    return this.http.post(`workorder/material-requirements-planning`, mrp).pipe(map(res => res.data));
  }

  changeMRP(mrp: MaterialRequirementsPlanning): Observable<MaterialRequirementsPlanning> {
    const url = `workorder/material-requirements-planning/${mrp.id}`;
    return this.http.put(url, mrp).pipe(map(res => res.data));
  }

  removeMRP(mrp: MaterialRequirementsPlanning): Observable<MaterialRequirementsPlanning> {
    const url = `workorder/material-requirements-planning/${mrp.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
