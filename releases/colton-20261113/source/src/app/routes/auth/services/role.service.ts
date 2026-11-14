import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { MenuGroup } from '../models/menu-group';  
import { Role } from '../models/role';
import { RolePermission } from '../models/role-permission';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private companyService: CompanyService,
    private utilService: UtilService) {}

  getRoles(name?: string, enabled?: boolean, 
    assignableToWorkTaskId?: number): Observable<Role[]> {

    const url = `resource/roles`;
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    if (name) {
      params = params.append('name', name);  
    }
    if (enabled != null) {
      params = params.append('enabled', enabled);   
    }
    if (assignableToWorkTaskId != null) {
      params = params.append('assignableToWorkTaskId', assignableToWorkTaskId);  
    }

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getRole(id: number): Observable<Role> {
    return this.http.get(`resource/roles/${id}`).pipe(map(res => res.data));
  }
  saveRole(role: Role): Observable<Role> {
    return this.http.post(`resource/roles`, role).pipe(map(res => res.data));
  }
  disableRole(roleId: number): Observable<Role> {
    return this.http.post(`resource/roles/${roleId}/disable`).pipe(map(res => res.data));
  }
  enableRole(roleId: number): Observable<Role> {
    return this.http.post(`resource/roles/${roleId}/enable`).pipe(map(res => res.data));
  }
  addRole(role: Role): Observable<Role> {
    return this.http.put(`resource/roles`, role).pipe(map(res => res.data));
  }

  getAccessibleMenus(id: number): Observable<MenuGroup[]> {
    return this.http.get(`resource/roles/${id}/menus`).pipe(map(res => res.data));
  }

  processMenus(roleId: number, assignedFullyFunctionalMenuIds: number[], 
    assignedDisplayOnlyMenuIds: number[], deassignedMenuIds: number[]) {
    if (assignedFullyFunctionalMenuIds.length === 0 && deassignedMenuIds.length === 0
        && assignedDisplayOnlyMenuIds.length === 0) {
      return of(`succeed`);
    } else {
      const url = `resource/roles/${roleId}/menus`
      
      
      let params = new HttpParams(); 

      params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
      params = params.append('assignedFullyFunctionalMenuIds', assignedFullyFunctionalMenuIds.join(',')); 
      params = params.append('assignedDisplayOnlyMenuIds', assignedDisplayOnlyMenuIds.join(',')); 
      params = params.append('deassigned', deassignedMenuIds.join(',')); 
      return this.http.post(url, null, params).pipe(map(res => res.data));
    }
  } 
  
  processOperationTypes(roleId: number, newlyAssignedOperationTypeIds: number[] ) { 
      const url = `resource/roles/${roleId}/operation-types`
      
      
      let params = new HttpParams(); 

      params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
      params = params.append('newlyAssignedOperationTypeIds', newlyAssignedOperationTypeIds.join(','));  
      return this.http.post(url, null, params).pipe(map(res => res.data)); 
  } 


  processUsers(roleId: number, assignedUserIds: number[], deassignedUserIds: number[]) {
    if (assignedUserIds.length === 0 && deassignedUserIds.length === 0) {
      return of(`succeed`);
    } else {
      const url = `resource/roles/${roleId}/users?assigned=${assignedUserIds.join(
        ',',
      )}&deassigned=${deassignedUserIds.join(',')}`;
      return this.http.post(url).pipe(map(res => res.data));
    }
  }
  
  processClients(roleId: number, assignedClientIds: number[], deassignedClientIds: number[], 
    nonClientDataAccessible: boolean, 
    allClientAccess: boolean) { 

      
    let params = new HttpParams();
    const url = `resource/roles/${roleId}/clients`;
      
    params = params.append('companyId', this.warehouseService.getCurrentWarehouse()!.companyId); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);
    params = params.append('assigned', assignedClientIds.join(',')); 
    params = params.append('deassigned', deassignedClientIds.join(',')); 
    params = params.append('nonClientDataAccessible', nonClientDataAccessible); 
    params = params.append('allClientAccess', allClientAccess); 

    return this.http.post(url, undefined, params).pipe(map(res => res.data)); 
  }


  deassignUser(roleId: number, userId: number) {
    const url = `resource/roles/${roleId}/users?deassigned=${userId}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
  deassignMenu(roleId: number, menuId: number) {
    const url = `resource/roles/${roleId}/menus?deassigned=${menuId}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
  deassignOperationType(roleId: number, operationTypeId: number) {
    const url = `resource/roles/${roleId}/operation-types?deassigned=${operationTypeId}`;
    return this.http.post(url).pipe(map(res => res.data));
  }

  assginPermission(roleId: number, rolePermissions: RolePermission[]) {
    const url = `resource/roles/${roleId}/permissions`;

    let params = new HttpParams();       
    params = params.append('companyId', this.warehouseService.getCurrentWarehouse()!.companyId); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);

    return this.http.post(url, rolePermissions, params).pipe(map(res => res.data));
  }
}
