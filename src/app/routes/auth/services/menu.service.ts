import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Menu } from '../models/menu';
import { MenuGroup } from '../models/menu-group';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService) {
       
     }

  getMenus(): Observable<MenuGroup[]> {
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    return this.http.get(`resource/menus`, params).pipe(map(res => res.data));
  }
  getWebMenus(): Observable<MenuGroup[]> {
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    return this.http.get(`resource/menus/web`, params).pipe(map(res => res.data));
  }
  getMobileMenus(): Observable<MenuGroup[]> {
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    return this.http.get(`resource/menus/mible`, params).pipe(map(res => res.data));
  }
  isAccessible(menu: Menu, accessibleMenuGroups: MenuGroup[]): boolean {
    return accessibleMenuGroups.some(accessibleMenuGroup =>
      accessibleMenuGroup.children.some(accessibleMenuSubGroup =>
        accessibleMenuSubGroup.children.some(accessibleMenu => accessibleMenu.id === menu.id),
      ),
    );
  }
  disableMenu(menu: Menu) : Observable<Menu> {
    return this.http.post(`resource/menu/${menu.id}/enable?enabled=false`).pipe(map(res => res.data));
  }
  enableMenu(menu: Menu) : Observable<Menu> {
    return this.http.post(`resource/menu/${menu.id}/enable?enabled=true`).pipe(map(res => res.data));
  }

  getCompanyAccessibleMenu(companyId: number): Observable<MenuGroup[]> {
    return this.http.get(`resource/menus/company-accessible?companyId=${this.companyService.getCurrentCompany()!.id}`).pipe(map(res => res.data));
  }

  
}
