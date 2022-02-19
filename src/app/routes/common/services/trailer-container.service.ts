import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Customer } from '../models/customer';
import { TrailerContainer } from '../models/trailer-container';

@Injectable({
  providedIn: 'root'
})
export class TrailerContainerService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private companyService: CompanyService,) { }

  getTrailerContainers(number?: string): Observable<TrailerContainer[]> {
    
    let url = `common/trailer-containers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;

    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  

  getTrailerContainer(trailerContainerId: number): Observable<TrailerContainer> { 

    return this.http
      .get(`common/trailer-containers/${  trailerContainerId}`)
      .pipe(map(res => res.data));
  }

  addTrailerContainer(trailerContainer: TrailerContainer): Observable<TrailerContainer> {
    return this.http.post('common/trailer-containers', trailerContainer).pipe(map(res => res.data));
  }

  changeTrailerContainer(trailerContainer: TrailerContainer): Observable<TrailerContainer> {
    const url = `common/trailer-containers/${  trailerContainer.id}`;
    return this.http.put(url, trailerContainer).pipe(map(res => res.data));
  }

  removeTrailerContainer(trailerContainer: TrailerContainer): Observable<TrailerContainer> {
    const url = `common/trailer-containers/${  trailerContainer.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 

}
