import { NgModule, Type } from '@angular/core'; 
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { DirectivesModule } from '../directives/directives.module';
import { BillingRoutingModule } from './billing-routing.module';
import { BillingInvoiceMaintenanceComponent } from './invoice-maintenance/invoice-maintenance.component';
import { BillingInvoiceComponent } from './invoice/invoice.component';
import { BillingRateMaintenanceComponent } from './rate-maintenance/rate-maintenance.component';
import { BillingRateComponent } from './rate/rate.component'; 
import { BillingVendorInvoiceMaintenanceComponent } from './vendor-invoice-maintenance/vendor-invoice-maintenance.component';
import { BillingBillableActivityTypeComponent } from './billable-activity-type/billable-activity-type.component';
import { BillingBillableActivityTypeMaintenanceComponent } from './billable-activity-type-maintenance/billable-activity-type-maintenance.component';
import { BillingBillableActivityComponent } from './billable-activity/billable-activity.component';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { I18nPipe } from '@delon/theme';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { STModule } from '@delon/abc/st';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzUploadModule } from 'ng-zorro-antd/upload';

const COMPONENTS: Array<Type<void>> = [
  BillingRateComponent,
  BillingRateMaintenanceComponent,
  BillingInvoiceMaintenanceComponent,
  BillingInvoiceComponent, 
  BillingVendorInvoiceMaintenanceComponent,
  BillingBillableActivityTypeComponent,
  BillingBillableActivityTypeMaintenanceComponent,
  BillingBillableActivityComponent];

@NgModule({
  imports: [ 
    BillingRoutingModule,
    NzStepsModule,
    DirectivesModule,
    NzDescriptionsModule ,
    PageHeaderComponent ,
    NzSpinModule ,
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    NzSelectModule,
    I18nPipe,
    NzButtonModule,
    STModule,
    CommonModule ,
    NzTableModule ,
    
    NzTabsModule ,
    NzBreadCrumbModule ,
    NzDividerModule,
    NzCardModule ,
    NzListModule ,
    NzInputModule ,
    NzInputNumberModule ,
    NzUploadModule ,
  ],
  declarations: COMPONENTS,
})
export class BillingModule { }
