import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { CommonRoutingModule } from './common-routing.module';

const COMPONENTS: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    CommonRoutingModule
  ],
  declarations: COMPONENTS,
})
export class CommonModule { }
