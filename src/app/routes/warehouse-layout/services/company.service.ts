import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Company } from '../models/company';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  constructor(private http: _HttpClient) {}

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

  isSingleCompanyServer(): boolean {
    return localStorage.getItem('single_company_server') === 'true';
  }
  setSingleCompanyServerFlag(singleCompanyServer: boolean) {
    localStorage.setItem('single_company_server', JSON.stringify(singleCompanyServer));
  }
  getDefaultCompanyCode(): string {
    if (localStorage.getItem('default_company_code') === null) {
      return null;
    } else {
      return JSON.parse(localStorage.getItem('default_company_code'));
    }
  }
  setDefaultCompanyCode(defaultCompanyCode: string) {
    if (defaultCompanyCode === null) {
      this.clearDefaultCompanyCode();
    } else {
      localStorage.setItem('default_company_code', JSON.stringify(defaultCompanyCode));
    }
  }
  clearDefaultCompanyCode() {
    localStorage.setItem('default_company_code', null);
  }

  setCurrentCompany(company: Company) {
    // We will save the current company in local storage so that
    // different tab / web broswer session can share the same warehouse id
    // sessionStorage.setItem('current_warehouse', JSON.stringify(warehouse));
    localStorage.setItem('current_company', JSON.stringify(company));
  }
  getCurrentCompany(): Company {
    return JSON.parse(localStorage.getItem('current_company'));
  }
}
