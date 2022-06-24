import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlertAlertComponent } from './alert/alert.component';
import { AlertConfigurationComponent } from './configuration/configuration.component';
import { AlertSubscriptionMaintenanceComponent } from './subscription-maintenance/subscription-maintenance.component';
import { AlertSubscriptionComponent } from './subscription/subscription.component';
import { AlertWebMessageAlertDetailComponent } from './web-message-alert-detail/web-message-alert-detail.component';
import { AlertWebMessageAlertComponent } from './web-message-alert/web-message-alert.component';

const routes: Routes = [

  { path: 'subscription', component: AlertSubscriptionComponent },
  { path: 'configuration', component: AlertConfigurationComponent },
  { path: 'alert', component: AlertAlertComponent },
  { path: 'subscription-maintenance', component: AlertSubscriptionMaintenanceComponent },
  { path: 'web-message-alert', component: AlertWebMessageAlertComponent },
  { path: 'web-message-alert-detail', component: AlertWebMessageAlertDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertRoutingModule { }
