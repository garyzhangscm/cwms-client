import { NgModule, Type } from '@angular/core';

import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module';
import { WorkTaskOperationTypeMaintenanceComponent } from './operation-type-maintenance/operation-type-maintenance.component';
import { WorkTaskOperationTypeComponent } from './operation-type/operation-type.component';
import { WorkTaskWorkTaskConfigurationMaintenanceComponent } from './work-task-configuration-maintenance/work-task-configuration-maintenance.component';
import { WorkTaskWorkTaskConfigurationComponent } from './work-task-configuration/work-task-configuration.component';
import { WorkTaskRoutingModule } from './work-task-routing.module';
import { WorkTaskWorkTaskComponent } from './work-task/work-task.component';

import { STModule } from '@delon/abc/st';
import { I18nPipe} from '@delon/theme';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider'; 
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

const COMPONENTS: Array<Type<void>> = [
  WorkTaskWorkTaskComponent,
  WorkTaskWorkTaskConfigurationComponent,
  WorkTaskOperationTypeComponent,
  WorkTaskOperationTypeMaintenanceComponent,
  WorkTaskWorkTaskConfigurationMaintenanceComponent];

  
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [    
    WorkTaskRoutingModule,
    NzStepsModule, 
    NzDescriptionsModule, 
    WarehouseLayoutModule,
    
    STModule,    
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    PageHeaderComponent ,
    I18nPipe,
    NzSpinModule ,
    NzCardModule ,
    NzDividerModule,  
    NzBreadCrumbModule , 
    NzButtonModule,
    NzSelectModule,    
    NzInputModule ,
    NzInputNumberModule ,
    NzListModule ,
    NzDropDownModule ,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
})
export class WorkTaskModule { }
