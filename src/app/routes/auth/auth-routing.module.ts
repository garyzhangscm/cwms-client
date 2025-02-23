import { NgModule } from '@angular/core';
import { RouterModule, Routes  } from '@angular/router';
import { aclCanActivate, ACLGuardType } from '@delon/acl';

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
import { AuthUserRoleComponent } from './user-role/user-role.component';
import { AuthUserWarehouseComponent } from './user-warehouse/user-warehouse.component';
import { AuthUserComponent } from './user/user.component';
import { AuthWarehouseUserComponent } from './warehouse-user/warehouse-user.component';
import { AuthWorkingTeamMaintenanceConfirmComponent } from './working-team-maintenance-confirm/working-team-maintenance-confirm.component';
import { AuthWorkingTeamMaintenanceComponent } from './working-team-maintenance/working-team-maintenance.component';
import { AuthWorkingTeamUserComponent } from './working-team-user/working-team-user.component';
import { AuthWorkingTeamComponent } from './working-team/working-team.component';
import { AuthUserQueryPopupComponent } from './user-query-popup/user-query-popup.component';
import { AuthRoleOperationTypeComponent } from './role-operation-type/role-operation-type.component';

const routes: Routes = [
  { path: 'user', component: AuthUserComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'role', component: AuthRoleComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/role' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'role-menu', component: AuthRoleMenuComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/role' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'user-role', component: AuthUserRoleComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user',  '/auth/role', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'role-user', component: AuthRoleUserComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user',  '/auth/role' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'role/maintenance', component: AuthRoleMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/role' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'user/maintenance', component: AuthUserMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'role/maintenance/confirm', component: AuthRoleMaintenanceConfirmComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/role', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'user/maintenance/confirm', component: AuthUserMaintenanceConfirmComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'working-team', component: AuthWorkingTeamComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/working-team', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'working-team/maintenance', component: AuthWorkingTeamMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/working-team', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'working-team/maintenance/confirm', component: AuthWorkingTeamMaintenanceConfirmComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/working-team' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'working-team/user', component: AuthWorkingTeamUserComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user' , '/auth/working-team', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'department', component: AuthDepartmentComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/department', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'department/maintenance', component: AuthDepartmentMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/department' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'role-client', component: AuthRoleClientComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/role' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'user-warehouse', component: AuthUserWarehouseComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'warehouse-user', component: AuthWarehouseUserComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/auth/user' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'role-permission', component: AuthRolePermissionComponent },
  { path: 'permission', component: AuthPermissionComponent },
  { path: 'user-query-popup', component: AuthUserQueryPopupComponent },
  { path: 'role-operation-type', component: AuthRoleOperationTypeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
