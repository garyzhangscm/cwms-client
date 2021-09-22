import { Injectable } from '@angular/core';
import { Menu, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MenuGroup } from '../models/menu-group';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private companyService: CompanyService) {
       
     }

  getMenus(): Observable<MenuGroup[]> {
    return this.http.get(`resource/menus?companyId=${this.companyService.getCurrentCompany()!.id}`).pipe(map(res => res.data));
  }
  getWebMenus(): Observable<MenuGroup[]> {
    return this.http.get(`resource/menus/web`).pipe(map(res => res.data));
  }
  getMobileMenus(): Observable<MenuGroup[]> {
    return this.http.get(`resource/menus/mible`).pipe(map(res => res.data));
  }
  isAccessible(menu: Menu, accessibleMenuGroups: MenuGroup[]): boolean {
    return accessibleMenuGroups.some(accessibleMenuGroup =>
      accessibleMenuGroup.children.some(accessibleMenuSubGroup =>
        accessibleMenuSubGroup.children.some(accessibleMenu => accessibleMenu.id === menu.id),
      ),
    );
  }
}
