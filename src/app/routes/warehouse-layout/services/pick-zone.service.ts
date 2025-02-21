import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';
import { PickZone } from '../models/pick-zone';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class PickZoneService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  loadPickZones(): Observable<PickZone[]> {
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    const url = `layout/pick-zones`;
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getPickZone(id: number): Observable<PickZone> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    return this.http.get(`layout/pick-zones/${id}`, params).pipe(map(res => res.data));
  }
  getPickZones(name?: string): Observable<PickZone[]> {
    let url = `layout/pick-zones?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    if (name) {
      params = params.append("name", name);
    }
 
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  addPickZone(PickZone: PickZone): Observable<PickZone> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    if (!PickZone.warehouse) {
      console.log(`warehouse is not setup yet`);
      PickZone.warehouse = this.warehouseService.getCurrentWarehouse();
    }
    return this.http.post('layout/pick-zones', PickZone).pipe(map(res => res.data));
  }

  changePickZone(locationGroup: PickZone): Observable<PickZone> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    const url = `layout/pick-zones/${  locationGroup.id}`;
    return this.http.put(url, locationGroup).pipe(map(res => res.data));
  }

  removePickZone(locationGroup: PickZone): Observable<PickZone> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    const url = `layout/pick-zones/${  locationGroup.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removePickZoneById(locationGroupId: number): Observable<PickZone> {
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    const url = `layout/pick-zones/${locationGroupId}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }  
}
