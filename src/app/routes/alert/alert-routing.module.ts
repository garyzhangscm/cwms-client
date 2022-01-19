import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlertAlertComponent } from './alert/alert.component';
import { AlertConfigurationComponent } from './configuration/configuration.component';
import { AlertSubscriptionMaintenanceComponent } from './subscription-maintenance/subscription-maintenance.component';
import { AlertSubscriptionComponent } from './subscription/subscription.component';

const routes: Routes = [

  { path: 'subscription', component: AlertSubscriptionComponent },
  { path: 'configuration', component: AlertConfigurationComponent },
  { path: 'alert', component: AlertAlertComponent },
  { path: 'subscription-maintenance', component: AlertSubscriptionMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertRoutingModule { }
