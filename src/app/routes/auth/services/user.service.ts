import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MenuService, _HttpClient , SettingsService } from '@delon/theme';
import { firstValueFrom, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocalStorageService } from '../../util/services/LocalStorageService';


import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { User } from '../models/user';
import { UserPermission } from '../models/user-permission';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private companyService: CompanyService, 
    private localStorageService: LocalStorageService,
              private menuService: MenuService, 
              private settings: SettingsService) {}

  getUsers(username?: string, rolename?: string, 
    workingTeamName?: string, firstname?: string, lastname?: string, 
    assignableToWorkTaskId?: number): Observable<User[]> {
    const url = `resource/users`;
    
    let params = new HttpParams(); 

    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    if (username) {
      params = params.append('username', username);  
    } 
    
    if (rolename) {
      params = params.append('rolename', rolename);  
    } 
    
    if (workingTeamName) {
      params = params.append('workingTeamName', workingTeamName);  
    }
    if (firstname) {
      params = params.append('firstname', firstname);  
    }
    if (lastname) {
      params = params.append('lastname', lastname);  
    }
    if (assignableToWorkTaskId != null) {
      params = params.append('assignableToWorkTaskId', assignableToWorkTaskId);  
    }
    

    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getUser(id: number): Observable<User> {
    return this.http.get(`resource/users/${id}`).pipe(map(res => res.data));
  }
  addUser(user: User): Observable<User> {
    return this.http.put(`resource/users`, user).pipe(map(res => res.data));
  }
  changeUser(user: User): Observable<User> {
    return this.http.post(`resource/users/${user.id}`, user).pipe(map(res => res.data));
  }
  changePassword(user: User, newPassword: string): Observable<User> {
    return this.http.post(`resource/users/${user.id}/password?newPassword=${newPassword}`, user).pipe(map(res => res.data));
  }


  processRoles(userId: number, assignedRoleIds: number[], deassignedRoleIds: number[]) {
    if (assignedRoleIds.length === 0 && deassignedRoleIds.length === 0) {
      return of(`succeed`);
    } else {
      const url = `resource/users/${userId}/roles?assigned=${assignedRoleIds.join(
        ',',
      )}&deassigned=${deassignedRoleIds.join(',')}`;
      return this.http.post(url).pipe(map(res => res.data));
    }
  }

  disableUsers(userIds: number[]): Observable<User[]> {
    return this.http.post(`resource/users/disable?userIds=${userIds}`).pipe(map(res => res.data));
  }

  disableUser(userId: number): Observable<User[]> {
    return this.http.post(`resource/users/disable?userIds=${userId}`).pipe(map(res => res.data));
  }
  enableUser(userId: number): Observable<User[]> {
    return this.http.post(`resource/users/enable?userIds=${userId}`).pipe(map(res => res.data));
  }
  lockUsers(userIds: number[]): Observable<User[]> {
    return this.http.post(`resource/users/lock?userIds=${userIds}`).pipe(map(res => res.data));
  }
  lockUser(userId: number): Observable<User[]> {
    return this.http.post(`resource/users/lock?userIds=${userId}`).pipe(map(res => res.data));
  }
  unlockUser(userId: number): Observable<User[]> {
    return this.http.post(`resource/users/unlock?userIds=${userId}`).pipe(map(res => res.data));
  }
  
  isCurrentUserAccessibleToMenu(menuUrl: string): boolean {
    // get all accssible menu 
    return this.menuService.getPathByUrl(menuUrl).length > 0;
    
    
  }

  getCurrentUsername() : string {
    
    return this.settings.user.name!;
  }

  getUserByNameSynchronous(username: string): Promise<User[]> {
    return firstValueFrom(this.getUsers(username));
  }
  setCurrentUser(user: User): void { 
    this.localStorageService.setItem('current_user',  JSON.stringify(user));
  }
  setupCurrentUser() {
    if (this.getCurrentUsername()) {
      this.getUsers(this.getCurrentUsername()).subscribe({
        next: (usersRes) => {
          if (usersRes.length > 0) {
            this.setCurrentUser(usersRes[0]);
          }

        }
      })
    }
  }

  async isCurrentUserAdmin(): Promise<boolean> {
    let user : User | undefined = await this.getCurrentUser();
    return user != null &&  user.admin == true
  }

  async getCurrentUser(): Promise<User | undefined>{ 
    let user: User | undefined = undefined;

    const data: User = this.localStorageService.getItem('current_user'); 
    if (data != null && data.username == this.getCurrentUsername()) {  
      user = data;
    }
    else if (this.getCurrentUsername()) {

      let users: User[] = await this.getUserByNameSynchronous(this.getCurrentUsername());
       
      if (users.length > 0) {
        this.setCurrentUser(users[0]);
        user = users[0];
        // console.log(` will return the first user that match with the name \n${JSON.stringify(user)}`);
      } 
    } 
    return user;
 
  }

  addTempUser(username: string, firstname: string, lastname: string) : Observable<User> {
    let params = new HttpParams();
    params = params.append('username', username);
    params = params.append('firstname', firstname);
    params = params.append('lastname', lastname);
    return this.http.post(`resource/user/new-temp-user?companyId=${this.companyService.getCurrentCompany()!.id}`, null, params).pipe(map(res => res.data));
  }
  
  copyUser(existingUserId: number, username: string, firstname: string, lastname: string) : Observable<User> {
    let params = new HttpParams();
    params = params.append('username', username);
    params = params.append('firstname', firstname);
    params = params.append('lastname', lastname);
    return this.http.post(`resource/users/${existingUserId}/copy?companyId=${this.companyService.getCurrentCompany()!.id}`, null, params).pipe(map(res => res.data));
  }

  async isCurrentPageDisplayOnly(link: string) : Promise<boolean> {

    const isAdmin = await this.isCurrentUserAdmin();
    if (isAdmin) {
      console.log(`current user is admin and has full access to any page`);
      return false;
    }
    const currentPageMenu = this.menuService.find({ 
      url: link,
      recursive: true });
   
    if (currentPageMenu) {
        // console.log(`we found the matched menu by link ${link}`);
        // console.log(`${currentPageMenu.i18n} - ${currentPageMenu.link} - ${currentPageMenu.displayOnly}`);
        // console.log(``)
        return currentPageMenu['displayOnly'];
    }

    console.log(`current user doesn't have access to this page`);
    return true;
  } 
  
  changeUserEmail(username: string, email: string) : Observable<User> {
    let params = new HttpParams();
    params = params.append('username', username);
    params = params.append('email', email); 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 

    return this.http.post(`resource/user/change-email`, null, params).pipe(map(res => res.data));
  }
 
  getUserPermissionByWebPage(webPageUrl: string) : Observable<UserPermission[]> {
    let params = new HttpParams();
    params = params.append('webPageUrl', webPageUrl); 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 

    return this.http.get(`resource/users/permission/by-web-page`, params).pipe(map(res => res.data));
  }
   
}
