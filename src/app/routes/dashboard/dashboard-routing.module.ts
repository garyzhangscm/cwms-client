import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { DashboardAnalysisComponent } from './analysis/analysis.component';
import { DashboardMonitorComponent } from './monitor/monitor.component';
import { DashboardV1Component } from './v1/v1.component';
import { DashboardWelcomeComponent } from './welcome/welcome.component';
import { DashboardWorkplaceComponent } from './workplace/workplace.component';

const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  { path: 'v1', component: DashboardV1Component , 
      canActivate: [ACLGuard], 
      data: { 
        guard:  {
          role: [ '/dashboard/v1' , 'admin', 'system-admin' ], 
        } as ACLGuardType,
        guard_url: '/exception/403'
      }
  },
  { path: 'analysis', component: DashboardAnalysisComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/dashboard/analysis', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'monitor', component: DashboardMonitorComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/dashboard/monitor' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'workplace', component: DashboardWorkplaceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/dashboard/workplace' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'welcome', component: DashboardWelcomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
