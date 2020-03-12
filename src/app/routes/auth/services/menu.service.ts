import { Injectable } from '@angular/core';
import { _HttpClient, Menu } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuGroup } from '../models/menu-group';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getMenus(): Observable<MenuGroup[]> {
    return this.http.get(`resource/menus`).pipe(map(res => res.data));
  }

  isAccessible(menu: Menu, accessibleMenuGroups: MenuGroup[]): boolean {
    return accessibleMenuGroups.some(accessibleMenuGroup =>
      accessibleMenuGroup.children.some(accessibleMenuSubGroup =>
        accessibleMenuSubGroup.children.some(accessibleMenu => accessibleMenu.id === menu.id),
      ),
    );
  }
}
