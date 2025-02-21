import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  aclCanActivate, ACLGuardType } from '@delon/acl';

import { WorkTaskOperationTypeMaintenanceComponent } from './operation-type-maintenance/operation-type-maintenance.component';
import { WorkTaskOperationTypeComponent } from './operation-type/operation-type.component';
import { WorkTaskWorkTaskConfigurationMaintenanceComponent } from './work-task-configuration-maintenance/work-task-configuration-maintenance.component';
import { WorkTaskWorkTaskConfigurationComponent } from './work-task-configuration/work-task-configuration.component';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const routes: Routes = [

  { path: 'work-task', component: WorkTaskWorkTaskComponent,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/work-task/work-task' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'work-task-configuration', component: WorkTaskWorkTaskConfigurationComponent ,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/work-task/work-task-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'operation-type', component: WorkTaskOperationTypeComponent ,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/work-task/operation-type' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'operation-type/maintenance', component: WorkTaskOperationTypeMaintenanceComponent,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/work-task/operation-type' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'work-task-configuration/maintenance', component: WorkTaskWorkTaskConfigurationMaintenanceComponent ,
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/work-task/work-task-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkTaskRoutingModule { }
