import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { WarehouseLayoutLocationDashboardComponent } from './location-dashboard/location-dashboard.component';
import { WarehouseLayoutLocationGroupMaintenanceConfirmComponent } from './location-group-maintenance-confirm/location-group-maintenance-confirm.component';
import { WarehouseLayoutLocationGroupMaintenanceComponent } from './location-group-maintenance/location-group-maintenance.component';
import { WarehouseLayoutLocationGroupComponent } from './location-group/location-group.component';
import { WarehouseLayoutLocationMaintenanceComponent } from './location-maintenance/location-maintenance.component';
import { WarehouseLayoutLocationQueryPopupComponent } from './location-query-popup/location-query-popup.component';
import { WarehouseLayoutWarehouseConfigurationComponent } from './warehouse-configuration/warehouse-configuration.component';
import { WarehouseLayoutWarehouseLayoutMaintenanceComponent } from './warehouse-layout-maintenance/warehouse-layout-maintenance.component';
import { WarehouseLayoutWarehouseLocationComponent } from './warehouse-location/warehouse-location.component';
import { WarehouseLayoutWarehouseMaintenanceConfirmComponent } from './warehouse-maintenance-confirm/warehouse-maintenance-confirm.component';
import { WarehouseLayoutWarehouseMaintenanceComponent } from './warehouse-maintenance/warehouse-maintenance.component';
import { WarehouseLayoutWarehouseComponent } from './warehouse/warehouse.component';
import { WarehouseLayoutPickZoneComponent } from './pick-zone/pick-zone.component';
import { WarehouseLayoutPickZoneMaintenanceComponent } from './pick-zone-maintenance/pick-zone-maintenance.component';

const routes: Routes = [
  { path: 'warehouse', component: WarehouseLayoutWarehouseComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'location-group', component: WarehouseLayoutLocationGroupComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/location-group', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'warehouse-maintenance', component: WarehouseLayoutWarehouseMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-maintenance', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'warehouse-maintenance/confirm', component: WarehouseLayoutWarehouseMaintenanceConfirmComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-maintenance', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'warehouse-maintenance/:id', component: WarehouseLayoutWarehouseMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-maintenance', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'warehouse-maintenance/:id/confirm', component: WarehouseLayoutWarehouseMaintenanceConfirmComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-maintenance', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'location-group-maintenance', component: WarehouseLayoutLocationGroupMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/location-group', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  {
    path: 'location-group-maintenance/confirm',
    component: WarehouseLayoutLocationGroupMaintenanceConfirmComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/location-group', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  {
    path: 'location-group-maintenance/:id/confirm',
    component: WarehouseLayoutLocationGroupMaintenanceConfirmComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/location-group', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'warehouse-location', component: WarehouseLayoutWarehouseLocationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-location', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'location-query-popup', component: WarehouseLayoutLocationQueryPopupComponent   
  }, 
  { path: 'warehouse-layout-maintenance', component: WarehouseLayoutWarehouseLayoutMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-layout-maintenance', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'warehouse-configuration', component: WarehouseLayoutWarehouseConfigurationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'location/maintenance', component: WarehouseLayoutLocationMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/warehouse-location', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'location-dashboard', component: WarehouseLayoutLocationDashboardComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/location-dashboard', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  ,
  { path: 'pick-zone', component: WarehouseLayoutPickZoneComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/warehouse-layout/pick-zone', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'pick-zone-maintenance', component: WarehouseLayoutPickZoneMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WarehouseLayoutRoutingModule { }
