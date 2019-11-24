import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Supplier } from '../models/supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}

  loadSuppliers(refresh: boolean = false): Observable<Supplier[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('common.supplier');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get('common/suppliers')
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.supplier', res)));
  }
  getSupplier(supplierId: number): Observable<Supplier> {
    const data = this.gzLocalStorageService.getItem('common.supplier.' + supplierId);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get('common/supplier/' + supplierId)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.supplier.' + supplierId, res)));
  }

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post('common/supplier', supplier).pipe(map(res => res.data));
  }

  changeSupplier(supplier: Supplier): Observable<Supplier> {
    const url = 'common/supplier/' + supplier.id;
    return this.http.put(url, supplier).pipe(map(res => res.data));
  }

  removeSupplier(supplier: Supplier): Observable<Supplier> {
    const url = 'common/supplier/' + supplier.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeSuppliers(suppliers: Supplier[]): Observable<Supplier[]> {
    const supplierIds: number[] = [];
    suppliers.forEach(supplier => {
      supplierIds.push(supplier.id);
    });
    const params = {
      supplier_ids: supplierIds.join(','),
    };
    return this.http.delete('common/supplier', params).pipe(map(res => res.data));
  }
}
