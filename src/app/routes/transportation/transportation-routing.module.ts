import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  aclCanActivate, ACLGuardType } from '@delon/acl';

import { TransportationCarrierMaintenanceComponent } from './carrier-maintenance/carrier-maintenance.component';
import { TransportationCarrierComponent } from './carrier/carrier.component';
import { TransportationEasyPostComponent } from './easy-post/easy-post.component';
import { TransportationTractorAppointmentMaintenanceComponent } from './tractor-appointment-maintenance/tractor-appointment-maintenance.component';
import { CommonTractorMaintenanceComponent } from './tractor-maintenance/tractor-maintenance.component';
import { TransportationTractorScheduleComponent } from './tractor-schedule/tractor-schedule.component';
import { CommonTractorComponent } from './tractor/tractor.component';
import { TransportationTrailerAppointmentMaintenanceComponent } from './trailer-appointment-maintenance/trailer-appointment-maintenance.component';
import { CommonTrailerMaintenanceComponent } from './trailer-maintenance/trailer-maintenance.component';
import { CommonTrailerComponent } from './trailer/trailer.component';

const routes: Routes = [
  { path: 'tractor', component: CommonTractorComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/tractor', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'tractor/maintenance', component: CommonTractorMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/tractor', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'trailer', component: CommonTrailerComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/trailer', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'trailer/maintenance', component: CommonTrailerMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/trailer', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'trailer/appointment/maintenance', component: TransportationTrailerAppointmentMaintenanceComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/trailer', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'tractor/appointment/maintenance', component: TransportationTractorAppointmentMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/tractor', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'tractor/schedule', component: TransportationTractorScheduleComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/tractor/schedule', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'carrier', component: TransportationCarrierComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/carrier', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'easy-post', component: TransportationEasyPostComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/easy-post', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'carrier-maintenance', component: TransportationCarrierMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/transportation/carrier', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransportationRoutingModule { }
