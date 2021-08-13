import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Client } from '../../common/models/client';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { RF } from '../models/rf';

@Injectable({
  providedIn: 'root'
})
export class RfService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
  ) {}

  
  getRFs(rfCode?: string): Observable<RF[]> {
    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec();

    let url = `resource/rfs?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (rfCode) {
      url = `${url}&rfCode=${httpUrlEncodingCodec.encodeValue(rfCode)}`;
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
}
