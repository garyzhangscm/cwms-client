import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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

const routes: Routes = [
  { path: 'client', component: CommonClientComponent },
  { path: 'client-maintenance', component: CommonClientMaintenanceComponent },
  { path: 'client-maintenance/address', component: CommonClientAddressMaintenanceComponent },
  { path: 'client-maintenance/confirm', component: CommonClientMaintenanceConfimComponent },
  { path: 'unit-of-measure', component: CommonUnitOfMeasureComponent },
  { path: 'unit-of-measure-maintenance', component: CommonUnitOfMeasureMaintenanceComponent },
  { path: 'unit-of-measure/confirm', component: CommonUnitOfMeasureConfirmComponent },
  { path: 'supplier', component: CommonSupplierComponent },
  { path: 'supplier-maintenance', component: CommonSupplierMaintenanceComponent },
  { path: 'supplier-maintenance/address', component: CommonSupplierAddressMaintenanceComponent },
  { path: 'supplier-maintenance/confirm', component: CommonSupplierMaintenanceConfirmComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonRoutingModule {}
