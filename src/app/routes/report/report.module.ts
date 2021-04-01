import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { ReportRoutingModule } from './report-routing.module';

const COMPONENTS: Type<void>[] = [];

const COMPONENTS_NOROUNT: Type<void>[] = [];
@NgModule({
  imports: [
    SharedModule,
    ReportRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class ReportModule { }
