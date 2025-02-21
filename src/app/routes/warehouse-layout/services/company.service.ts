import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from '../../util/services/LocalStorageService';

import { Company } from '../models/company';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private http: _HttpClient, private localStorageService: LocalStorageService) {}

  getCompanies(code?: string, name?: string): Observable<Company[]> {
    let params = new HttpParams();
    if (code) {
      params = params.append('code', code);
    }
    if (name) {
      params = params.append('name', name);
    }
    return this.http.get(`layout/companies`, params).pipe(map(res => res.data));
  }

  getCompany(id: number): Observable<Company> {
    return this.http.get(`layout/companies/${id}`).pipe(map(res => res.data));
  }
  
  validateCompanyCode(companyCode: string): Observable<number> {
    return this.http.get(`layout/companies/validate?code=${companyCode}`).pipe(map(res => res.data));
  }

  isSingleCompanyServer(): boolean {
    return this.localStorageService.getItem('single_company_server') === 'true';
  }
  setSingleCompanyServerFlag(singleCompanyServer: boolean): void {
    this.localStorageService.setItem('single_company_server', JSON.stringify(singleCompanyServer));
  }
  getDefaultCompanyCode(): string | null {
    if (this.localStorageService.getItem('default_company_code') === null) {
      return null;
    } else {
      return JSON.parse(this.localStorageService.getItem('default_company_code')!);
    }
  }
  setDefaultCompanyCode(defaultCompanyCode: string): void{
    if (defaultCompanyCode === null) {
      this.clearDefaultCompanyCode();
    } else {
      this.localStorageService.setItem('default_company_code', JSON.stringify(defaultCompanyCode));
    }
  }
  clearDefaultCompanyCode(): void {
    this.localStorageService.setItem('default_company_code', '');
  }

  setCurrentCompany(company: Company): void {
    // We will save the current company in local storage so that
    // different tab / web broswer session can share the same warehouse id
    // sessionStorage.setItem('current_warehouse', JSON.stringify(warehouse));
    this.localStorageService.setItem('current_company', JSON.stringify(company));
  }
  getCurrentCompany(): Company | null{
    return JSON.parse(this.localStorageService.getItem('current_company')!);
  }
  
  enableCompany(id: number): Observable<Company> {
    return this.http.post(`layout/companies/${id}/enable`).pipe(map(res => res.data));
  }
  disableCompany(id: number): Observable<Company> {
    return this.http.post(`layout/companies/${id}/disable`).pipe(map(res => res.data));
  }

  getFullLogo(id: number): Observable<any> {
    return this.http
          .get(`layout/companies/${id}/logo.svg`, { responseType: 'text' })
          .pipe(map(res => res.data));
  }

  getLogo(id: number): Observable<any> {
    return this.http
          .get(`layout/companies/${id}/logo-full.svg`, { responseType: 'text' })
          .pipe(map(res => res.data));
  }

}
