import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { UtilRoutingModule } from './util-routing.module';

const COMPONENTS: Type<void>[] = [];

@NgModule({
  imports: [
    SharedModule,
    UtilRoutingModule
  ],
  declarations: COMPONENTS,
})
export class UtilModule { }
