import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { AlertRoutingModule } from './alert-routing.module';
import { AlertAlertTemplateMaintenanceComponent } from './alert-template-maintenance/alert-template-maintenance.component';
import { AlertAlertTemplateComponent } from './alert-template/alert-template.component';
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
  AlertWebMessageAlertDetailComponent,
  AlertAlertTemplateComponent,
  AlertAlertTemplateMaintenanceComponent];

@NgModule({
  imports: [
    SharedModule,
    AlertRoutingModule,
    NzResultModule ,
    NzDescriptionsModule,
    NzStepsModule
  ],
  declarations: COMPONENTS,
})
export class AlertModule { }
