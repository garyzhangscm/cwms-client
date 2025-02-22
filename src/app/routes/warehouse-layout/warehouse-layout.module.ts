import { NgModule, Type } from '@angular/core';

import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStepsModule } from 'ng-zorro-antd/steps'; 

import { DirectivesModule } from '../directives/directives.module'; 
import { WarehouseLayoutLocationDashboardComponent } from './location-dashboard/location-dashboard.component';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutLocationMaintenanceComponent } from './location-maintenance/location-maintenance.component';
import { WarehouseLayoutLocationQueryPopupComponent } from './location-query-popup/location-query-popup.component';
import { WarehouseLayoutWarehouseConfigurationComponent } from './warehouse-configuration/warehouse-configuration.component';
import { WarehouseLayoutWarehouseLayoutMaintenanceComponent } from './warehouse-layout-maintenance/warehouse-layout-maintenance.component';
import { WarehouseLayoutRoutingModule } from './warehouse-layout-routing.module';
import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location/warehouse-location.component';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm/warehouse-maintenance-confirm.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseLayoutPickZoneComponent } from './pick-zone/pick-zone.component';
import { WarehouseLayoutPickZoneMaintenanceComponent } from './pick-zone-maintenance/pick-zone-maintenance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';
import { I18nPipe } from '@delon/theme';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzListModule } from 'ng-zorro-antd/list';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';

const COMPONENTS: Array<Type<void>> = [
  WarehouseLayoutWarehouseComponent,
  WarehouseLayoutLocationGroupComponent,
  WarehouseLayoutWarehouseMaintenanceComponent,
  WarehouseLayoutWarehouseMaintenanceConfirmComponent,
  WarehouseLayoutLocationGroupMaintenanceComponent,
  WarehouseLayoutLocationGroupMaintenanceConfirmComponent,
  WarehouseLayoutWarehouseLocationComponent,
  WarehouseLayoutLocationQueryPopupComponent,
  WarehouseLayoutWarehouseLayoutMaintenanceComponent,
  WarehouseLayoutWarehouseConfigurationComponent,
  WarehouseLayoutLocationMaintenanceComponent,
  WarehouseLayoutLocationDashboardComponent,
  WarehouseLayoutPickZoneComponent,
  WarehouseLayoutPickZoneMaintenanceComponent];

const COMPONENTS_NOROUNT: Array<Type<void>> = [];


@NgModule({
  imports: [
    WarehouseLayoutRoutingModule,
    DirectivesModule,
    NzDescriptionsModule,
    NzStepsModule,  
    NzResultModule,    
    STModule,    
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule,
    PageHeaderComponent ,
    I18nPipe,
    NzSpinModule ,
    NzCardModule ,
    NzButtonModule,
    NzSelectModule,
    NzTableModule ,
    NzDividerModule,
    NzBreadCrumbModule ,
    NzTagModule ,
    NzIconModule ,
    NzInputNumberModule ,
    NzDropDownModule ,
    NzTabsModule ,
    NzListModule ,
    CommonModule, 
    NzInputModule ,
    NzModalModule,
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  exports: [WarehouseLayoutLocationQueryPopupComponent]
})
export class WarehouseLayoutModule { }
