import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { DirectivesModule } from '../directives/directives.module';
import { AuthRoutingModule } from './auth-routing.module';
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

const COMPONENTS: Type<void>[] = [
  AuthUserComponent,
  AuthRoleComponent,
  AuthRoleMenuComponent,
  AuthUserRoleComponent,
  AuthRoleUserComponent,
  AuthRoleMaintenanceComponent,
  AuthUserMaintenanceComponent,
  AuthRoleMaintenanceConfirmComponent,
  AuthUserMaintenanceConfirmComponent,
  AuthWorkingTeamComponent,
  AuthWorkingTeamMaintenanceComponent,
  AuthWorkingTeamMaintenanceConfirmComponent,
  AuthWorkingTeamUserComponent];
const COMPONENTS_NOROUNT: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    AuthRoutingModule,
    NzDescriptionsModule,
    NzTreeModule, 
    NzTransferModule, 
    DirectivesModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class AuthModule { }
