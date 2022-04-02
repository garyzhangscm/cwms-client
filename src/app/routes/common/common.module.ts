import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { DirectivesModule } from '../directives/directives.module';
import { UtilModule } from '../util/util.module';
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
import { CommonSupplierAddressMaintenanceComponent } from './supplier-address-maintenance/supplier-address-maintenance.component';
import { CommonSupplierMaintenanceConfirmComponent } from './supplier-maintenance-confirm/supplier-maintenance-confirm.component';
import { CommonSupplierMaintenanceComponent } from './supplier-maintenance/supplier-maintenance.component';
import { CommonSupplierComponent } from './supplier/supplier.component';  
import { CommonUnitOfMeasureConfirmComponent } from './unit-of-measure-confirm/unit-of-measure-confirm.component';
import { CommonUnitOfMeasureMaintenanceComponent } from './unit-of-measure-maintenance/unit-of-measure-maintenance.component';
import { CommonUnitOfMeasureComponent } from './unit-of-measure/unit-of-measure.component';

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
  CommonPrintButtonComponent, ];


const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [
    SharedModule,
    CommonRoutingModule,
    NzDescriptionsModule,
    DirectivesModule,
    NzStepsModule,
    NzAutocompleteModule,
    GooglePlaceModule,    
    UtilModule,
    NzResultModule ,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  exports: [CommonPrintButtonComponent],
  entryComponents: COMPONENTS_NOROUNT
})
export class CommonModule { }
