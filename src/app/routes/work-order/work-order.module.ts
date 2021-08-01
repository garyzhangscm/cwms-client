import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkOrderRoutingModule } from './work-order-routing.module';

const COMPONENTS: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    WorkOrderRoutingModule
  ],
  declarations: COMPONENTS,
})
export class WorkOrderModule { }
