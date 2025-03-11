import { NgModule, Type } from '@angular/core'; 
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTransferModule } from 'ng-zorro-antd/transfer';
import { NzTreeModule } from 'ng-zorro-antd/tree';

import { DirectivesModule } from '../directives/directives.module';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthDepartmentMaintenanceComponent } from './department-maintenance/department-maintenance.component';
import { AuthDepartmentComponent } from './department/department.component';
import { AuthPermissionComponent } from './permission/permission.component';
import { AuthRoleClientComponent } from './role-client/role-client.component';
import { AuthRoleMaintenanceConfirmComponent } from './role-maintenance-confirm/role-maintenance-confirm.component';
import { AuthRoleMaintenanceComponent } from './role-maintenance/role-maintenance.component';
import { AuthRoleMenuComponent } from './role-menu/role-menu.component';
import { AuthRolePermissionComponent } from './role-permission/role-permission.component';
import { AuthRoleUserComponent } from './role-user/role-user.component';
import { AuthRoleComponent } from './role/role.component';
import { AuthUserMaintenanceConfirmComponent } from './user-maintenance-confirm/user-maintenance-confirm.component';
import { AuthUserMaintenanceComponent } from './user-maintenance/user-maintenance.component';
import { AuthUserQueryPopupComponent } from './user-query-popup/user-query-popup.component';
import { AuthUserRoleComponent } from './user-role/user-role.component';
import { AuthUserWarehouseComponent } from './user-warehouse/user-warehouse.component';
import { AuthUserComponent } from './user/user.component';
import { AuthWarehouseUserComponent } from './warehouse-user/warehouse-user.component';
import { AuthWorkingTeamMaintenanceConfirmComponent } from './working-team-maintenance-confirm/working-team-maintenance-confirm.component';
import { AuthWorkingTeamMaintenanceComponent } from './working-team-maintenance/working-team-maintenance.component';
import { AuthWorkingTeamUserComponent } from './working-team-user/working-team-user.component';
import { AuthWorkingTeamComponent } from './working-team/working-team.component';
import { AuthRoleOperationTypeComponent } from './role-operation-type/role-operation-type.component';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

const COMPONENTS: Array<Type<void>> = [
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
  AuthWorkingTeamUserComponent,
  AuthDepartmentComponent,
  AuthDepartmentMaintenanceComponent,
  AuthRoleClientComponent,
  AuthUserWarehouseComponent,
  AuthWarehouseUserComponent,
  AuthRolePermissionComponent,
  AuthPermissionComponent,
  AuthUserQueryPopupComponent,
  AuthRoleOperationTypeComponent];
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [ 
    AuthRoutingModule,
    NzDescriptionsModule,
    NzTreeModule,
    NzTransferModule,
    DirectivesModule, NzStepsModule,
    NzResultModule ,
    PageHeaderComponent ,
    NzSpinModule ,
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    STModule,
    I18nPipe,
    NzButtonModule,
    NzBreadCrumbModule ,
    NzCardModule ,
    NzDividerModule,
    NzTableModule ,
    NzDropDownModule ,
    NzTabsModule ,
    NzSwitchModule ,
    CommonModule ,
    NzInputModule ,
    NzIconModule ,
    NzSelectModule,
    NzCheckboxModule ,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  exports: [AuthUserQueryPopupComponent]
})
export class AuthModule { }
