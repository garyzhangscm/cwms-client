 
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';   
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { LocalStorageService } from '../../util/services/LocalStorageService';
 
import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Client } from '../models/client';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(
    private http: _HttpClient,
    private localStorageService: LocalStorageService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private utilService: UtilService
  ) {}

  loadClients(refresh: boolean = false): Observable<Client[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.localStorageService.getItem('common.client');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get(`common/clients?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem('common.client', res)));
  }
  
  getClients(name?: string): Observable<Client[]> {

    const url = `common/clients`;
 
    let params = new HttpParams(); 
    
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    if (name) {
      params = params.append('name', name.trim());  
    }
    return this.http
      .get(url, params)
      .pipe(map(res => res.data));
  }

  getClient(clientId: number): Observable<Client> {
    const data = this.localStorageService.getItem(`common.client.${  clientId}`);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get(`common/clients/${  clientId}`)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.localStorageService.setItem(`common.client.${  clientId}`, res)));
  }

  addClient(client: Client): Observable<Client> {
    return this.http.post('common/clients', client).pipe(map(res => res.data));
  }

  changeClient(client: Client): Observable<Client> {
    const url = `common/clients/${  client.id}`;
    return this.http.put(url, client).pipe(map(res => res.data));
  }

  removeClient(clientId: number): Observable<Client> {
    const url = `common/clients/${clientId}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeClients(clients: Client[]): Observable<Client[]> {
    const clientIds: number[] = [];
    clients.forEach(client => {
      clientIds.push(client.id!);
    });
    const params = {
      clientIds: clientIds.join(','),
    };
    return this.http.delete('common/clients', params).pipe(map(res => res.data));
  }
}
