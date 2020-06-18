import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Observable, of } from 'rxjs';
import { Supplier } from '../models/supplier';
import { map, tap } from 'rxjs/operators';
import { Customer } from '../models/customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}

  loadCustomers(refresh: boolean = false): Observable<Customer[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('common.customer');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get('common/customers')
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.customer', res)));
  }
  getCustomer(customerId: number): Observable<Customer> {
    const data = this.gzLocalStorageService.getItem('common.customer.' + customerId);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get('common/customers/' + customerId)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.customer.' + customerId, res)));
  }

  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post('common/customers', customer).pipe(map(res => res.data));
  }

  changeCustomer(customer: Customer): Observable<Customer> {
    const url = 'common/customers/' + customer.id;
    return this.http.put(url, customer).pipe(map(res => res.data));
  }

  removeCustomer(customer: Customer): Observable<Customer> {
    const url = 'common/customers/' + customer.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeCustomers(customers: Customer[]): Observable<Customer[]> {
    const customerIds: number[] = [];
    customers.forEach(customer => {
      customerIds.push(customer.id);
    });
    const params = {
      customer_ids: customerIds.join(','),
    };
    return this.http.delete('common/customers', params).pipe(map(res => res.data));
  }
}
