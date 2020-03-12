import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getUsers(username?: string): Observable<User[]> {
    let url = `resource/users`;
    if (username) {
      url = `${url}?username=${username}`;
    }
    console.log(`start to get users from ${url}`);

    return this.http.get(url).pipe(map(res => res.data));
  }

  getUser(id: number): Observable<User> {
    return this.http.get(`resource/users/${id}`).pipe(map(res => res.data));
  }
  addUser(user: User) {
    return this.http.put(`resource/users`, user).pipe(map(res => res.data));
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
}
