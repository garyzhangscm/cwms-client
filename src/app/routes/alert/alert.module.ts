import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';

import { AlertRoutingModule } from './alert-routing.module';
import { AlertAlertTemplateMaintenanceComponent } from './alert-template-maintenance/alert-template-maintenance.component';
import { AlertAlertTemplateComponent } from './alert-template/alert-template.component';
import { AlertAlertComponent } from './alert/alert.component';
import { AlertConfigurationComponent } from './configuration/configuration.component';
import { AlertSubscriptionMaintenanceComponent } from './subscription-maintenance/subscription-maintenance.component';
import { AlertSubscriptionComponent } from './subscription/subscription.component';
import { AlertWebMessageAlertDetailComponent } from './web-message-alert-detail/web-message-alert-detail.component';
import { AlertWebMessageAlertComponent } from './web-message-alert/web-message-alert.component';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';

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
    AlertRoutingModule,
    NzResultModule ,
    NzDescriptionsModule,
    NzStepsModule,
    NzSpinModule ,
    PageHeaderComponent ,
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    NzSelectModule,
    I18nPipe,
    NzDatePickerModule ,
    NzButtonModule,
    STModule,
    NzToolTipModule ,
    CommonModule,
    NzDropDownModule ,
    NzBreadCrumbModule ,
    NzInputModule ,
    NzCardModule ,
    NzDividerModule ,
    NzInputNumberModule ,
    NzIconModule ,
    NzTableModule ,
  ],
  declarations: COMPONENTS,
})
export class AlertModule { }
