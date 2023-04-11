import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';
import { WorkTaskWorkTaskConfigurationComponent } from './work-task-configuration/work-task-configuration.component';
import { WorkTaskOperationTypeComponent } from './operation-type/operation-type.component';

const routes: Routes = [

  { path: 'work-task', component: WorkTaskWorkTaskComponent,
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/work-task/work-task' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }}
  ,
  { path: 'work-task-configuration', component: WorkTaskWorkTaskConfigurationComponent },
  { path: 'operation-type', component: WorkTaskOperationTypeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkTaskRoutingModule { }
