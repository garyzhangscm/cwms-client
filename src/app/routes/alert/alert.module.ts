import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';

import { AlertRoutingModule } from './alert-routing.module';
import { AlertAlertComponent } from './alert/alert.component';
import { AlertConfigurationComponent } from './configuration/configuration.component';
import { AlertSubscriptionMaintenanceComponent } from './subscription-maintenance/subscription-maintenance.component';
import { AlertSubscriptionComponent } from './subscription/subscription.component';
import { AlertWebMessageAlertDetailComponent } from './web-message-alert-detail/web-message-alert-detail.component';
import { AlertWebMessageAlertComponent } from './web-message-alert/web-message-alert.component';

const COMPONENTS: Array<Type<void>> = [
  AlertSubscriptionComponent,
  AlertConfigurationComponent,
  AlertAlertComponent,
  AlertSubscriptionMaintenanceComponent,
  AlertWebMessageAlertComponent,
  AlertWebMessageAlertDetailComponent];

@NgModule({
  imports: [
    SharedModule,
    AlertRoutingModule
  ],
  declarations: COMPONENTS,
})
export class AlertModule { }
