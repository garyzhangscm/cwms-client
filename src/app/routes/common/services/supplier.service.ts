 
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Supplier } from '../models/supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private utilService: UtilService
  ) {}

  loadSuppliers(refresh: boolean = true): Observable<Supplier[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem('common.supplier');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`common/suppliers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem('common.supplier', res)));
  }
  
  getSuppliers(name?: string): Observable<Supplier[]> {
    
    let url = `common/suppliers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;
 
    if (name) {
      url = `${url}&name=${this.utilService.encodeValue(name.trim())}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }

  getSupplier(supplierId: number): Observable<Supplier> {
    const data = this.localStorageService.getItem(`common.supplier.${  supplierId}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`common/suppliers/${  supplierId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`common.supplier.${  supplierId}`, res)));
  }

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post('common/suppliers', supplier).pipe(map(res => res.data));
  }

  changeSupplier(supplier: Supplier): Observable<Supplier> {
    const url = `common/suppliers/${  supplier.id}`;
    return this.http.put(url, supplier).pipe(map(res => res.data));
  }

  removeSupplier(supplier: Supplier): Observable<Supplier> {
    const url = `common/suppliers/${  supplier.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeSuppliers(suppliers: Supplier[]): Observable<Supplier[]> {
    const supplierIds: number[] = [];
    suppliers.forEach(supplier => {
      supplierIds.push(supplier.id!);
    });
    const params = {
      supplierIds: supplierIds.join(','),
      warehouseId: this.warehouseService.getCurrentWarehouse().id
    };
    return this.http.delete('common/suppliers', params).pipe(map(res => res.data));
  }
}
