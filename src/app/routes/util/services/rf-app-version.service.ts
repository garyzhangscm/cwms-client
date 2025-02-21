
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { RFAppVersion } from '../models/rf-app-version';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class RfAppVersionService {
  constructor(
    private http: _HttpClient, 
    private cmopanyService: CompanyService,
    private utilService: UtilService,
  ) {}

  
  getRFAppVersions(isLatestVersion?: boolean, versionNumber?: string): Observable<RFAppVersion[]> {
     

    let url = `resource/rf-app-versions?companyId=${this.cmopanyService.getCurrentCompany()!.id}`;
    if (versionNumber) {
      url = `${url}&versionNumber=${this.utilService.encodeValue(versionNumber)}`;
    }
     
    if (isLatestVersion) {
      url = `${url}&isLatestVersion=${isLatestVersion}`;
    }
    
    return this.http.get(url).pipe(map(res => res.data));
  }
  getRFAppVersion(id: number): Observable<RFAppVersion> {
    return this.http.get(`resource/rf-app-versions/${id}`).pipe(map(res => res.data));
  }

  addRFAppVersion(rfAppVersion: RFAppVersion): Observable<RFAppVersion> {
    return this.http.put('resource/rf-app-versions', rfAppVersion).pipe(map(res => res.data));
  }
 
  changeRFAppVersion(rfAppVersion: RFAppVersion): Observable<RFAppVersion> {
    return this.http.post(`resource/rf-app-versions/${rfAppVersion.id}`, rfAppVersion).pipe(map(res => res.data));
  }

  removeRFAppVersion(rfAppVersion: RFAppVersion): Observable<RFAppVersion> {
    const url = `resource/rf-app-versions/${rfAppVersion.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
}
