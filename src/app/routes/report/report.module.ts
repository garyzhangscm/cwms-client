import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { DirectivesModule } from '../directives/directives.module';
import { ReportRoutingModule } from './report-routing.module';
import { ReportComponent } from './report/report.component';

const COMPONENTS: Type<void>[] = [
  ReportComponent];

const COMPONENTS_NOROUNT: Type<void>[] = [];
@NgModule({
  imports: [
    SharedModule,
    ReportRoutingModule,
    DirectivesModule,
    NzDescriptionsModule, 
    NzStatisticModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class ReportModule { }
