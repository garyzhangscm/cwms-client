import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { WarehouseLayoutRoutingModule } from './warehouse-layout-routing.module';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';

const COMPONENTS = [
  WarehouseLayoutWarehouseComponent,
  WarehouseLayoutLocationGroupComponent];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [
    SharedModule,
    WarehouseLayoutRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  entryComponents: COMPONENTS_NOROUNT
})
export class WarehouseLayoutModule { }
