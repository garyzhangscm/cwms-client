import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { WorkTaskOperationTypeMaintenanceComponent } from './operation-type-maintenance/operation-type-maintenance.component';
import { WorkTaskOperationTypeComponent } from './operation-type/operation-type.component';
import { WorkTaskWorkTaskConfigurationMaintenanceComponent } from './work-task-configuration-maintenance/work-task-configuration-maintenance.component';
import { WorkTaskWorkTaskConfigurationComponent } from './work-task-configuration/work-task-configuration.component';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const routes: Routes = [

  { path: 'work-task', component: WorkTaskWorkTaskComponent,
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-task/work-task' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'work-task-configuration', component: WorkTaskWorkTaskConfigurationComponent ,
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-task/work-task-configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'operation-type', component: WorkTaskOperationTypeComponent ,
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-task/operation-type' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'operation-type/maintenance', component: WorkTaskOperationTypeMaintenanceComponent,
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-task/operation-type' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'work-task-configuration/maintenance', component: WorkTaskWorkTaskConfigurationMaintenanceComponent ,
    canActivate: [ACLGuard], 
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
