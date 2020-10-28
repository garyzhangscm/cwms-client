import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { SiteInformation } from '../models/site-information';

@Injectable({
  providedIn: 'root',
})
export class SiteInformationService {
  constructor(private http: _HttpClient,
              private companyService: CompanyService)  {}

  getSiteInformation(username?: string): Observable<SiteInformation[]> {
    let url = `resource/site-information?companyId=${this.companyService.getCurrentCompany()?.id}`;
    if (username) {
      url = `${url}&username=${username}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }
}
