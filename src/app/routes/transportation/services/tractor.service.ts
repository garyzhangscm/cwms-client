
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Tractor } from '../models/tractor';
import { Trailer } from '../models/trailer';

@Injectable({
  providedIn: 'root'
})
export class TractorService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private utilService: UtilService,
    private companyService: CompanyService,) { }

  getTractors(number?: string): Observable<Tractor[]> {
    
    let url = `common/tractors?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
 
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number.trim())}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  

  getTractor(tractorId: number): Observable<Tractor> { 

    return this.http
      .get(`common/tractors/${  tractorId}`)
      .pipe(map(res => res.data));
  }

  addTractor(tractor: Tractor, hasAttachedTrailer: boolean, autoCreatedTrailer: boolean, attachedTrailerIds: string): Observable<Tractor> {
    let url = `common/tractors?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
    
    url = `${url}&hasAttachedTrailer=${hasAttachedTrailer}`;
    url = `${url}&autoCreatedTrailer=${autoCreatedTrailer}`;
    
    if(hasAttachedTrailer && !autoCreatedTrailer) {
      url = `${url}&attachedTrailerIds=${attachedTrailerIds}`;
    } 
    return this.http.post(url, tractor).pipe(map(res => res.data));
  }

  changeTractor(tractor: Tractor): Observable<Tractor> {
    const url = `common/tractors/${  tractor.id}`;
    return this.http.put(url, tractor).pipe(map(res => res.data));
  }

  removeTractor(tractor: Tractor): Observable<Tractor> {
    const url = `common/tractors/${  tractor.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 
}
