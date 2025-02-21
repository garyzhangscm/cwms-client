import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { Mould } from '../models/mould';

@Injectable({
  providedIn: 'root'
})
export class MouldService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getMoulds(name?: string, description?: string): Observable<Mould[]> {
    let url = `workorder/moulds?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (name) {
      url = `${url}&name=${name}`;
    }
    if (description) {
      url = `${url}&description=${description}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getMould(id: number): Observable<Mould> {
    return this.http.get(`workorder/moulds/${id}`).pipe(map(res => res.data));
  } 
 
  addMould(mould: Mould): Observable<Mould> {
    return this.http.post(`workorder/moulds`, mould).pipe(map(res => res.data));
  }

  changeMould(mould: Mould): Observable<Mould> {
    const url = `workorder/moulds/${mould.id}`;
    return this.http.put(url, mould).pipe(map(res => res.data));
  }

  removeMould(mould: Mould): Observable<Mould> {
    const url = `workorder/moulds/${mould.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
