import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { Trailer } from '../models/trailer';

@Injectable({
  providedIn: 'root'
})
export class TrailerService {

  constructor(
    private http: _HttpClient, 
    private warehouseService: WarehouseService,
    private companyService: CompanyService,) { }

  getTrailers(number?: string): Observable<Trailer[]> {
    
    let url = `common/trailers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;

    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (number) {
      url = `${url}&number=${httpUrlEncodingCodec.encodeValue(number.trim())}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  

  getTrailer(trailerId: number): Observable<Trailer> { 

    return this.http
      .get(`common/trailers/${  trailerId}`)
      .pipe(map(res => res.data));
  }

  addTrailer(trailer: Trailer): Observable<Trailer> {
    return this.http.post('common/trailers', trailer).pipe(map(res => res.data));
  }

  changeTrailer(trailer: Trailer): Observable<Trailer> {
    const url = `common/trailers/${  trailer.id}`;
    return this.http.put(url, trailer).pipe(map(res => res.data));
  }

  removeTrailer(trailer: Trailer): Observable<Trailer> {
    const url = `common/trailers/${  trailer.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  } 

}
