import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MenuGroup } from '../models/menu-group'; 
import { Permission } from '../models/permission';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private companyService: CompanyService,
    private utilService: UtilService) {}

  getPermissions(menuIds?: string): Observable<Permission[]> {
    
    const url = `resource/permissions`;

    let params = new HttpParams(); 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    if (menuIds) {
      params = params.append('menuIds', menuIds);  
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }
 
}
