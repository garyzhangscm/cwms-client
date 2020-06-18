import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { GzLocalStorageServiceService } from '@shared/service/gz-local-storage-service.service';
import { Client } from '../models/client';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor(private http: _HttpClient, private gzLocalStorageService: GzLocalStorageServiceService) {}

  loadClients(refresh: boolean = false): Observable<Client[]> {
    // if we can find the value in local storage, we get it from their.
    // otherwise we get from server
    if (!refresh) {
      const data = this.gzLocalStorageService.getItem('common.client');
      if (data !== null) {
        return of(data);
      }
    }
    return this.http
      .get('common/clients')
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.client', res)));
  }
  getClient(clientId: number): Observable<Client> {
    const data = this.gzLocalStorageService.getItem('common.client.' + clientId);
    if (data !== null) {
      return of(data);
    }

    return this.http
      .get('common/clients/' + clientId)
      .pipe(map(res => res.data))
      .pipe(tap(res => this.gzLocalStorageService.setItem('common.client.' + clientId, res)));
  }

  addClient(client: Client): Observable<Client> {
    return this.http.post('common/clients', client).pipe(map(res => res.data));
  }

  changeClient(client: Client): Observable<Client> {
    const url = 'common/clients/' + client.id;
    return this.http.put(url, client).pipe(map(res => res.data));
  }

  removeClient(client: Client): Observable<Client> {
    const url = 'common/clients/' + client.id;
    return this.http.delete(url).pipe(map(res => res.data));
  }

  removeClients(clients: Client[]): Observable<Client[]> {
    const clientIds: number[] = [];
    clients.forEach(client => {
      clientIds.push(client.id);
    });
    const params = {
      client_ids: clientIds.join(','),
    };
    return this.http.delete('common/clients', params).pipe(map(res => res.data));
  }
}
