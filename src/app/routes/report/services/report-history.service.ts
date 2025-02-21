import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ReportHistory } from '../models/report-history';

@Injectable({
  providedIn: 'root'
})
export class ReportHistoryService {

  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getAll(
    name?: string,  
  ): Observable<ReportHistory[]> {
    let url = `resource/report-histories?warehouseId=${this.warehouseService.getCurrentWarehouse().id.toString()}`; 
    
    if (name) {
      url = `${url}&name=${name}`;
    }  

    return this.http.get(url).pipe(map(res => res.data));
  }

  download(fileName: string): Observable<Blob>{
    
    let url = `resource/report-histories/download?fileName=${fileName}`; 
    
    console.log(`will download from ${url}`);
    return this.http.get(url);

  }
}
