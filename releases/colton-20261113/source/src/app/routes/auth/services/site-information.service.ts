import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { SiteInformation } from '../models/site-information';

@Injectable({
  providedIn: 'root',
})
export class SiteInformationService {
  constructor(private http: _HttpClient,
              private companyService: CompanyService, 
              private warehouseService: WarehouseService)  {}

  getSiteInformation(username?: string): Observable<SiteInformation[]> {
    let url = `resource/site-information`;
    
    let params = new HttpParams();
    if (this.companyService.getCurrentCompany() != null) {

      params = params.append('companyId', this.companyService.getCurrentCompany()!.id);
    }
    if (this.warehouseService.getCurrentWarehouse() != null) {

      params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);
    }
    if (username) {
      params = params.append('username', username); 
    } 

    return this.http.get(url).pipe(map(res => res.data));
  }
}
