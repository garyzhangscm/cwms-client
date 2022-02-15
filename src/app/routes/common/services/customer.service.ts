import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { GzLocalStorageService } from '../../util/services/gz-local-storage.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(
    private http: _HttpClient,
    private gzLocalStorageService: GzLocalStorageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
  ) {}

  loadCustomers(): Observable<Customer[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server 
    return this.http
      .get(`common/customers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));
  }
  getCustomers(name?: string): Observable<Customer[]> {
    
    let url = `common/customers?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&companyId=${this.companyService.getCurrentCompany()!.id}`;

    const httpUrlEncodingCodec = new HttpUrlEncodingCodec(); 
    if (name) {
      url = `${url}&name=${httpUrlEncodingCodec.encodeValue(name.trim())}`;
    }
    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }
  

  getCustomer(customerId: number): Observable<Customer> {
    const data = this.gzLocalStorageService.getItem(`common.customer.${  customerId}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`common/customers/${  customerId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem(`common.customer.${  customerId}`, res)));
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post('common/customers', customer).pipe(map(res => res.data));
  }

  changeCustomer(customer: Customer): Observable<Customer> {
    const url = `common/customers/${  customer.id}`;
    return this.http.put(url, customer).pipe(map(res => res.data));
  }

  removeCustomer(customer: Customer): Observable<Customer> {
    const url = `common/customers/${  customer.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeCustomers(customers: Customer[]): Observable<Customer[]> {
    const customerIds: number[] = [];
    customers.forEach(customer => {
      customerIds.push(customer.id!);
    });
    const params = {
      customer_ids: customerIds.join(','),
    };
    return this.http.delete('common/customers', params).pipe(map(res => res.data));
  }
}
