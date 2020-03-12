import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthUserComponent } from './user/user.component';
import { AuthRoleComponent } from './role/role.component';
import { AuthRoleMenuComponent } from './role-menu/role-menu.component';
import { AuthUserRoleComponent } from './user-role/user-role.component';
import { AuthRoleUserComponent } from './role-user/role-user.component';
import { AuthRoleMaintenanceComponent } from './role-maintenance/role-maintenance.component';
import { AuthUserMaintenanceComponent } from './user-maintenance/user-maintenance.component';
import { AuthRoleMaintenanceConfirmComponent } from './role-maintenance-confirm/role-maintenance-confirm.component';
import { AuthUserMaintenanceConfirmComponent } from './user-maintenance-confirm/user-maintenance-confirm.component';

const COMPONENTS = [
  AuthUserComponent,
  AuthRoleComponent,
  AuthRoleMenuComponent,
  AuthUserRoleComponent,
  AuthRoleUserComponent,
  AuthRoleMaintenanceComponent,
  AuthUserMaintenanceComponent,
  AuthRoleMaintenanceConfirmComponent,
  AuthUserMaintenanceConfirmComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    AuthRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class AuthModule { }
