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
    data: { guard: 'dashboard/v1' as ACLGuardType  }},
  { path: 'analysis', component: DashboardAnalysisComponent },
  { path: 'monitor', component: DashboardMonitorComponent },
  { path: 'workplace', component: DashboardWorkplaceComponent }
,
  { path: 'welcome', component: DashboardWelcomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
