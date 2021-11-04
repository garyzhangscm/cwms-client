import { NgModule } from '@angular/core';
import { RouterModule, Routes  } from '@angular/router';

import { AuthDepartmentMaintenanceComponent } from './department-maintenance/department-maintenance.component';
import { AuthDepartmentComponent } from './department/department.component';
import { AuthGuard } from './guard/auth.guard';
import { AuthRoleMaintenanceConfirmComponent } from './role-maintenance-confirm/role-maintenance-confirm.component';
import { AuthRoleMaintenanceComponent } from './role-maintenance/role-maintenance.component';
import { AuthRoleMenuComponent } from './role-menu/role-menu.component';
import { AuthRoleUserComponent } from './role-user/role-user.component';
import { AuthRoleComponent } from './role/role.component';
import { AuthUserMaintenanceConfirmComponent } from './user-maintenance-confirm/user-maintenance-confirm.component';
import { AuthUserMaintenanceComponent } from './user-maintenance/user-maintenance.component';
import { AuthUserRoleComponent } from './user-role/user-role.component';
import { AuthUserComponent } from './user/user.component';
import { AuthWorkingTeamMaintenanceConfirmComponent } from './working-team-maintenance-confirm/working-team-maintenance-confirm.component';
import { AuthWorkingTeamMaintenanceComponent } from './working-team-maintenance/working-team-maintenance.component';
import { AuthWorkingTeamUserComponent } from './working-team-user/working-team-user.component';
import { AuthWorkingTeamComponent } from './working-team/working-team.component';

const routes: Routes = [
  { path: 'user', component: AuthUserComponent, canActivate: [AuthGuard] },
  { path: 'role', component: AuthRoleComponent, canActivate: [AuthGuard] },
  { path: 'role-menu', component: AuthRoleMenuComponent},
  { path: 'user-role', component: AuthUserRoleComponent },
  { path: 'role-user', component: AuthRoleUserComponent },
  { path: 'role/maintenance', component: AuthRoleMaintenanceComponent },
  { path: 'user/maintenance', component: AuthUserMaintenanceComponent },
  { path: 'role/maintenance/confirm', component: AuthRoleMaintenanceConfirmComponent },
  { path: 'user/maintenance/confirm', component: AuthUserMaintenanceConfirmComponent },
  { path: 'working-team', component: AuthWorkingTeamComponent, canActivate: [AuthGuard]  },
  { path: 'working-team/maintenance', component: AuthWorkingTeamMaintenanceComponent },
  { path: 'working-team/maintenance/confirm', component: AuthWorkingTeamMaintenanceConfirmComponent },
  { path: 'working-team/user', component: AuthWorkingTeamUserComponent },
  { path: 'department', component: AuthDepartmentComponent },
  { path: 'department/maintenance', component: AuthDepartmentMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
