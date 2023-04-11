import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { WorkTaskRoutingModule } from './work-task-routing.module';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';
import { WorkTaskWorkTaskConfigurationComponent } from './work-task-configuration/work-task-configuration.component';
import { WorkTaskOperationTypeComponent } from './operation-type/operation-type.component';

const COMPONENTS: Type<void>[] = [
  WorkTaskWorkTaskComponent,
  WorkTaskWorkTaskConfigurationComponent,
  WorkTaskOperationTypeComponent];

@NgModule({
  imports: [
    SharedModule,
    WorkTaskRoutingModule
  ],
  declarations: COMPONENTS,
})
export class WorkTaskModule { }
