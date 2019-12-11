import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SystemControlledNumberService {
  constructor(private http: _HttpClient) {}

  getNextAvailableId(type: string): Observable<string> {
    return this.http.get(`common/system-controlled-number/${type}/next`).pipe(map(res => res.data.nextNumber));
  }
}
