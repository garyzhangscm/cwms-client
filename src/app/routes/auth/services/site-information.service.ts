import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { SiteInformation } from '../models/site-information';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SiteInformationService {
  constructor(private http: _HttpClient) {}

  getSiteInformation(username?: string): Observable<SiteInformation[]> {
    let url = `resource/site-information`;
    if (username) {
      url = `${url}?username=${username}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
}
