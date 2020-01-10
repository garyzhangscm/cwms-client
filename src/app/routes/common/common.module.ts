import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { CommonRoutingModule } from './common-routing.module';
import { CommonClientComponent } from './client/client.component';
import { CommonClientMaintenanceComponent } from './client-maintenance/client-maintenance.component';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance/client-address-maintenance.component';
import { CommonClientMaintenanceConfimComponent } from './client-maintenance-confim/client-maintenance-confim.component';
import { CommonUnitOfMeasureComponent } from './unit-of-measure/unit-of-measure.component';
import { CommonUnitOfMeasureMaintenanceComponent } from './unit-of-measure-maintenance/unit-of-measure-maintenance.component';
import { CommonUnitOfMeasureConfirmComponent } from './unit-of-measure-confirm/unit-of-measure-confirm.component';
import { CommonSupplierComponent } from './supplier/supplier.component';
import { CommonSupplierMaintenanceComponent } from './supplier-maintenance/supplier-maintenance.component';
import { CommonSupplierAddressMaintenanceComponent } from './supplier-address-maintenance/supplier-address-maintenance.component';
import { CommonSupplierMaintenanceConfirmComponent } from './supplier-maintenance-confirm/supplier-maintenance-confirm.component';
import { CommonCustomerComponent } from './customer/customer.component';
import { CommonCustomerMaintenanceComponent } from './customer-maintenance/customer-maintenance.component';
import { CommonCustomerMaintenanceConfirmComponent } from './customer-maintenance-confirm/customer-maintenance-confirm.component';
import { CommonCustomerAddressMaintenanceComponent } from './customer-address-maintenance/customer-address-maintenance.component';

const COMPONENTS = [
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
  CommonCustomerAddressMaintenanceComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    CommonRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class CommonModule { }
