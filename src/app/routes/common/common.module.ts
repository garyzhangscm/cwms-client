import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { NgModule, Type } from '@angular/core'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { Loader } from '@googlemaps/js-api-loader';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';


import { DirectivesModule } from '../directives/directives.module';
import { UtilModule } from '../util/util.module';
import { CommonAbcCategoryComponent } from './abc-category/abc-category.component';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance/client-address-maintenance.component';
import { CommonClientMaintenanceConfimComponent } from './client-maintenance-confim/client-maintenance-confim.component';
import { CommonClientMaintenanceComponent } from './client-maintenance/client-maintenance.component';
import { CommonClientComponent } from './client/client.component';
import { CommonRoutingModule } from './common-routing.module';
import { CommonCustomerAddressMaintenanceComponent } from './customer-address-maintenance/customer-address-maintenance.component';
import { CommonCustomerMaintenanceConfirmComponent } from './customer-maintenance-confirm/customer-maintenance-confirm.component';
import { CommonCustomerMaintenanceComponent } from './customer-maintenance/customer-maintenance.component';
import { CommonCustomerComponent } from './customer/customer.component';
import { CommonPrintButtonComponent } from './print-button/print-button.component';
import { CommonReasonCodeMaintenanceComponent } from './reason-code-maintenance/reason-code-maintenance.component';
import { CommonReasonCodeComponent } from './reason-code/reason-code.component';
import { CommonSupplierAddressMaintenanceComponent } from './supplier-address-maintenance/supplier-address-maintenance.component';
import { CommonSupplierMaintenanceConfirmComponent } from './supplier-maintenance-confirm/supplier-maintenance-confirm.component';
import { CommonSupplierMaintenanceComponent } from './supplier-maintenance/supplier-maintenance.component';
import { CommonSupplierComponent } from './supplier/supplier.component';  
import { CommonUnitOfMeasureConfirmComponent } from './unit-of-measure-confirm/unit-of-measure-confirm.component';
import { CommonUnitOfMeasureMaintenanceComponent } from './unit-of-measure-maintenance/unit-of-measure-maintenance.component';
import { CommonUnitOfMeasureComponent } from './unit-of-measure/unit-of-measure.component';
import { CommonVelocityComponent } from './velocity/velocity.component';

const COMPONENTS: Array<Type<void>> = [
  CommonClientComponent,
  CommonClientMaintenanceComponent,
  CommonClientAddressMaintenanceComponent,
  CommonClientMaintenanceConfimComponent,
  CommonUnitOfMeasureComponent,
  CommonUnitOfMeasureMaintenanceComponent,
  CommonUnitOfMeasureConfirmComponent,
  CommonSupplierComponent,
  CommonSupplierMaintenanceComponent,
  CommonSupplierAddressMaintenanceComponent,
  CommonSupplierMaintenanceConfirmComponent,
  CommonCustomerComponent,
  CommonCustomerMaintenanceComponent,
  CommonCustomerMaintenanceConfirmComponent,
  CommonCustomerAddressMaintenanceComponent,
  CommonPrintButtonComponent, 
  CommonAbcCategoryComponent,
  CommonVelocityComponent,
  CommonReasonCodeComponent,
  CommonReasonCodeMaintenanceComponent];


const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
    imports: [ 
        CommonRoutingModule,
        NzDescriptionsModule,
        DirectivesModule,
        NzStepsModule,
        NzAutocompleteModule, 
        UtilModule,
        NzDropDownModule ,
        NzResultModule,
        NzSpinModule ,
        PageHeaderComponent ,
        NzFormModule,
        FormsModule, 
        ReactiveFormsModule,
        STModule,
        I18nPipe,
        NzBreadCrumbModule ,        
        NzButtonModule,
        NzSelectModule,
        NzCardModule ,
        NzDividerModule,
        NzTableModule ,
        NzCheckboxModule ,
        NzInputNumberModule ,
        NzIconModule ,
        NzToolTipModule ,
        NgxGpAutocompleteModule,
    ],
    declarations: [
        ...COMPONENTS,
        ...COMPONENTS_NOROUNT
    ],
    exports: [CommonPrintButtonComponent],
    providers: [
       {
         provide: Loader,
         useValue: new Loader({
           apiKey: 'AIzaSyDkPmh0PEC7JTCutUhWuN3BUU38M2fvR5s',
           libraries: ['places']
         })
       }, 
     ],
})
export class CWMSCommonModule { }
