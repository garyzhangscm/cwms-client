import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { CompanyMenu } from '../models/company-menu';

@Injectable({
  providedIn: 'root'
})
export class CompanyMenuService {

  constructor(
    private http: _HttpClient, 
    private companyService: CompanyService,
  ) {}

  
  getCompanyMenus(companyId?: number): Observable<CompanyMenu[]> { 
    if (companyId) {

      return this.http.get(`resource/company-menus?companyId=${companyId}`).pipe(map(res => res.data));
    }
    else {
      
      return this.http.get(`resource/company-menus?companyId=${this.companyService.getCurrentCompany()?.id}`).pipe(map(res => res.data));
    }
     
    
  }

  
  assignCompanyMenu(companyId: number, assignedMenuIds: number[], deassignedMenuIds: number[]) {
    
    if (assignedMenuIds.length === 0 && deassignedMenuIds.length === 0) {
      return of(`succeed`);
    } else {
      const url = `resource/company-menus/assign/${companyId}?assigned=${assignedMenuIds.join(
        ',',
      )}&deassigned=${deassignedMenuIds.join(',')}`;
      return this.http.post(url).pipe(map(res => res.data));
    }
  }
}
