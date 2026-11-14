import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PickConfirmStrategy } from '../models/pick-confirm-strategy';

@Injectable({
  providedIn: 'root'
})
export class PickConfirmStrategyService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getPickConfirmStrategies(
    sequence?: number,
    itemId?: number,
    itemName?: string,
    itemFamilyId?: number, 
    locationId?: number,
    locationGroupId?: number,
    locationGroupTypeId?: number,  
  ): Observable<PickConfirmStrategy[]> {
    
    const url = `outbound/pick-confirm-strategy` ;


    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    if (sequence) {
        params = params.append('sequence', sequence);  
    }

    if (itemId != null) {
      params = params.append('itemId', itemId);   
    }
    if (itemName) {
      params = params.append('itemName', itemName);   
    }
    
    if (itemFamilyId != null) {
      params = params.append('itemFamilyId', itemFamilyId);   
    }
    
    if (locationId != null) {
      params = params.append('locationId', locationId);   
    }
    if (locationGroupId != null) {
      params = params.append('locationGroupId', locationGroupId);   
    }
    if (locationGroupTypeId != null) {
      params = params.append('locationGroupTypeId', locationGroupTypeId);   
    } 

    return this.http.get(url, params).pipe(map(res => res.data));
  }
  
  getPickConfirmStrategy(id: number): Observable<PickConfirmStrategy> {
    let url = `outbound/pick-confirm-strategy/${id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.get(url).pipe(map(res => res.data));
  }
  addPickConfirmStrategy(pickConfirmStrategy: PickConfirmStrategy): Observable<PickConfirmStrategy> {
    let url = `outbound/pick-confirm-strategy?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.put(url, pickConfirmStrategy).pipe(map(res => res.data));
  }
  changePickConfirmStrategy(pickConfirmStrategy: PickConfirmStrategy): Observable<PickConfirmStrategy> {
    let url = `outbound/pick-confirm-strategy/${pickConfirmStrategy.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.post(url, pickConfirmStrategy).pipe(map(res => res.data));
  }
  removePickConfirmStrategy(pickConfirmStrategy: PickConfirmStrategy): Observable<PickConfirmStrategy> {
    let url = `outbound/pick-confirm-strategy/${pickConfirmStrategy.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
   

    return this.http.delete(url).pipe(map(res => res.data));
  }
}
