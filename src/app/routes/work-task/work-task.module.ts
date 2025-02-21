import { NgModule, Type } from '@angular/core';
import { SharedModule } from '@shared';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module';
import { WorkTaskOperationTypeMaintenanceComponent } from './operation-type-maintenance/operation-type-maintenance.component';
import { WorkTaskOperationTypeComponent } from './operation-type/operation-type.component';
import { WorkTaskWorkTaskConfigurationMaintenanceComponent } from './work-task-configuration-maintenance/work-task-configuration-maintenance.component';
import { WorkTaskWorkTaskConfigurationComponent } from './work-task-configuration/work-task-configuration.component';
import { WorkTaskRoutingModule } from './work-task-routing.module';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

const COMPONENTS: Array<Type<void>> = [
  WorkTaskWorkTaskComponent,
  WorkTaskWorkTaskConfigurationComponent,
  WorkTaskOperationTypeComponent,
  WorkTaskOperationTypeMaintenanceComponent,
  WorkTaskWorkTaskConfigurationMaintenanceComponent];

@NgModule({
  imports: [
    SharedModule,
    WorkTaskRoutingModule,
    NzStepsModule, 
    NzDescriptionsModule, 
    WarehouseLayoutModule,
  ],
  declarations: COMPONENTS,
})
export class WorkTaskModule { }
