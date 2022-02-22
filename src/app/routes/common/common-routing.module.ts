import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/guard/auth.guard';
import { CommonClientAddressMaintenanceComponent } from './client-address-maintenance/client-address-maintenance.component';
import { CommonClientMaintenanceConfimComponent } from './client-maintenance-confim/client-maintenance-confim.component';
import { CommonClientMaintenanceComponent } from './client-maintenance/client-maintenance.component';
import { CommonClientComponent } from './client/client.component';
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

const routes: Routes = [
  { path: 'client', component: CommonClientComponent, canActivate: [AuthGuard] },
  { path: 'client-maintenance', component: CommonClientMaintenanceComponent },
  { path: 'client-maintenance/address', component: CommonClientAddressMaintenanceComponent },
  { path: 'client-maintenance/confirm', component: CommonClientMaintenanceConfimComponent },
  { path: 'unit-of-measure', component: CommonUnitOfMeasureComponent, canActivate: [AuthGuard] },
  { path: 'unit-of-measure-maintenance', component: CommonUnitOfMeasureMaintenanceComponent },
  { path: 'unit-of-measure/confirm', component: CommonUnitOfMeasureConfirmComponent },
  { path: 'supplier', component: CommonSupplierComponent, canActivate: [AuthGuard] },
  { path: 'supplier-maintenance', component: CommonSupplierMaintenanceComponent },
  { path: 'supplier-maintenance/address', component: CommonSupplierAddressMaintenanceComponent },
  { path: 'supplier-maintenance/confirm', component: CommonSupplierMaintenanceConfirmComponent },
  { path: 'customer', component: CommonCustomerComponent, canActivate: [AuthGuard] },
  { path: 'customer-maintenance', component: CommonCustomerMaintenanceComponent },
  { path: 'customer-maintenance/confirm', component: CommonCustomerMaintenanceConfirmComponent },
  { path: 'customer-maintenance/address', component: CommonCustomerAddressMaintenanceComponent },
  { path: 'print-button', component: CommonPrintButtonComponent },];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonRoutingModule { }
