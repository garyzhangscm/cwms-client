
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme'; 
import { Observable, of  } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Carrier } from '../models/carrier';

@Injectable({
  providedIn: 'root'
})
export class CarrierService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private utilService: UtilService
  ) {}

  loadCarriers(refresh: boolean = false): Observable<Carrier[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server 
     
    if (!refresh) {
      const data = this.localStorageService.getItem('common.carrier');
      if (data !== null) {
        return of(data);
      }
    }

    return this.http
      .get(`common/carriers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem('common.carrier', res)));;
  }

  getCarriers(name?: string): Observable<Carrier[]> {
    
    let url = `common/carriers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
 
    if (name) {
      url = `${url}&name=${this.utilService.encodeValue(name.trim())}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  

  getCarrier(carrierId: number): Observable<Carrier> { 
    return this.http
      .get(`common/carriers/${carrierId}`)
      .pipe(map(res => res.data)); 
  }

  addCarrier(carrier: Carrier): Observable<Carrier> {
    return this.http.post('common/carriers', carrier).pipe(map(res => res.data));
  }

  changeCarrier(carrier: Carrier): Observable<Carrier> {
    const url = `common/carriers/${ carrier.id}`;
    return this.http.put(url, carrier).pipe(map(res => res.data));
  }

  removeCarrier(carrierId: number): Observable<Carrier> {
    const url = `common/carriers/${carrierId}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  disableCarrier(carrierId: number): Observable<Carrier> {
    const url = `common/carriers/${carrierId}/disable`;
    return this.http.post(url).pipe(map(res => res.data));
  }
  
  enableCarrier(carrierId: number): Observable<Carrier> {
    const url = `common/carriers/${carrierId}/enable`;
    return this.http.post(url).pipe(map(res => res.data));
  }
 
}
