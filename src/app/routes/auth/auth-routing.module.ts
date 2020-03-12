import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthUserComponent } from './user/user.component';
import { AuthRoleComponent } from './role/role.component';
import { AuthRoleMenuComponent } from './role-menu/role-menu.component';
import { AuthUserRoleComponent } from './user-role/user-role.component';
import { AuthRoleUserComponent } from './role-user/role-user.component';
import { AuthRoleMaintenanceComponent } from './role-maintenance/role-maintenance.component';
import { AuthUserMaintenanceComponent } from './user-maintenance/user-maintenance.component';
import { AuthRoleMaintenanceConfirmComponent } from './role-maintenance-confirm/role-maintenance-confirm.component';
import { AuthUserMaintenanceConfirmComponent } from './user-maintenance-confirm/user-maintenance-confirm.component';

const routes: Routes = [
  { path: 'user', component: AuthUserComponent },
  { path: 'role', component: AuthRoleComponent },
  { path: 'role-menu', component: AuthRoleMenuComponent },
  { path: 'user-role', component: AuthUserRoleComponent },
  { path: 'role-user', component: AuthRoleUserComponent },
  { path: 'role/maintenance', component: AuthRoleMaintenanceComponent },
  { path: 'user/maintenance', component: AuthUserMaintenanceComponent },
  { path: 'role/maintenance/confirm', component: AuthRoleMaintenanceConfirmComponent },
  { path: 'user/maintenance/confirm', component: AuthUserMaintenanceConfirmComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
