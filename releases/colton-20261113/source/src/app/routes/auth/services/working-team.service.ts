import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkingTeam } from '../models/working-team';

@Injectable({
  providedIn: 'root',
})
export class WorkingTeamService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getWorkingTeams(name?: string, enabled?: boolean): Observable<WorkingTeam[]> {
    let url = `resource/working-teams?companyId=${this.warehouseService.getCurrentWarehouse().companyId}`;
    if (name) {
      url = `${url}&name=${name}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getWorkingTeam(id: number): Observable<WorkingTeam> {
    return this.http.get(`resource/working-teams/${id}`).pipe(map(res => res.data));
  }
  saveWorkingTeam(workingTeam: WorkingTeam): Observable<WorkingTeam> {
    return this.http.post(`resource/working-teams`, workingTeam).pipe(map(res => res.data));
  }
  disableWorkingTeam(workingTeamId: number): Observable<WorkingTeam> {
    return this.http.post(`resource/working-teams/${workingTeamId}/disable`).pipe(map(res => res.data));
  }
  enableWorkingTeam(workingTeamId: number): Observable<WorkingTeam> {
    return this.http.post(`resource/working-teams/${workingTeamId}/enable`).pipe(map(res => res.data));
  }
  addWorkingTeam(workingTeam: WorkingTeam): Observable<WorkingTeam> {
    return this.http.put(`resource/working-teams`, workingTeam).pipe(map(res => res.data));
  }

  processUsers(workingTeamId: number, assignedUserIds: number[], deassignedUserIds: number[]) {
    if (assignedUserIds.length === 0 && deassignedUserIds.length === 0) {
      return of(`succeed`);
    } else {
      const url = `resource/working-teams/${workingTeamId}/users?assigned=${assignedUserIds.join(
        ',',
      )}&deassigned=${deassignedUserIds.join(',')}`;
      return this.http.post(url).pipe(map(res => res.data));
    }
  }

  deassignUser(workingTeamId: number, userId: number) {
    const url = `resource/working-teams/${workingTeamId}/users?deassigned=${userId}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
}
