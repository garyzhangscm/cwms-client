import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { AuthGuard } from '../auth/guard/auth.guard';
import { UtilBillableRequestComponent } from './billable-request/billable-request.component';
import { UtilCompanyMaintenanceComponent } from './company-maintenance/company-maintenance.component';
import { UtilCompanyMenuComponent } from './company-menu/company-menu.component';
import { UtilCompanyComponent } from './company/company.component';
import { UtilDataInitComponent } from './data-init/data-init.component';
import { UtilDataTransferComponent } from './data-transfer/data-transfer.component';
import { UtilFileUploadComponent } from './file-upload/file-upload.component';
import { UtilIconListComponent } from './icon-list/icon-list.component';
import { UtilMenuComponent } from './menu/menu.component';
import { UtilOrderQueryPopupComponent } from './order-query-popup/order-query-popup.component'; 
import { UtilQuickbookAuthComponent } from './quickbook-auth/quickbook-auth.component';
import { UtilQuickbookOnlineConfigurationComponent } from './quickbook-online-configuration/quickbook-online-configuration.component';
import { UtilQuickbookPermissionComponent } from './quickbook-permission/quickbook-permission.component';
import { UtilRfAppVersionMaintenanceComponent } from './rf-app-version-maintenance/rf-app-version-maintenance.component';
import { UtilRfAppVersionComponent } from './rf-app-version/rf-app-version.component';
import { UtilRfConfigurationComponent } from './rf-configuration/rf-configuration.component';
import { UtilRfMaintenanceComponent } from './rf-maintenance/rf-maintenance.component';
import { UtilRfComponent } from './rf/rf.component';
import { UtilSystemConfigurationComponent } from './system-configuration/system-configuration.component';  
import { UtilSystemControlledNumberMaintenanceComponent } from './system-controlled-number-maintenance/system-controlled-number-maintenance.component';
import { UtilSystemControlledNumberComponent } from './system-controlled-number/system-controlled-number.component';
import { UtilTableColumnSelectionComponent } from './table-column-selection/table-column-selection.component';
import { UtilTestDataInitComponent } from './test-data-init/test-data-init.component';
import { UtilTesterComponent } from './tester/tester.component';
import { UtilWorkOrderQueryPopupComponent } from './work-order-query-popup/work-order-query-popup.component'; 

const routes: Routes = [
  { path: 'file-upload', component: UtilFileUploadComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/file-upload', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'file-upload/:filetype', component: UtilFileUploadComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/file-upload', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'test-data-init', component: UtilTestDataInitComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [   'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'icon-list', component: UtilIconListComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [   'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'tester', component: UtilTesterComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [  'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'system-configuration', component: UtilSystemConfigurationComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/system-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'table-column-selection', component: UtilTableColumnSelectionComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [   'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rf', component: UtilRfComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/rf', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rf/maintenance', component: UtilRfMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/rf', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'system-controlled-number', component: UtilSystemControlledNumberComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/system-controlled-number', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'system-controlled-number/maintenance', component: UtilSystemControlledNumberMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/system-controlled-number', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'data-init', component: UtilDataInitComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [  'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'billable-request', component: UtilBillableRequestComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/billable-request', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rf-app-version', component: UtilRfAppVersionComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [   'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rf-app-version/maintenance', component: UtilRfAppVersionMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [  'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'company', component: UtilCompanyComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [  'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'company-maintenance', component: UtilCompanyMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'menu', component: UtilMenuComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [  'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'company-menu', component: UtilCompanyMenuComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [   'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'data-transfer', component: UtilDataTransferComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [   'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'work-order-query-popup', component: UtilWorkOrderQueryPopupComponent  
  },
  { path: 'order-query-popup', component: UtilOrderQueryPopupComponent  ,  
  },
  { path: 'quickbook-auth', component: UtilQuickbookAuthComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/quickbook-auth', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'quickbook-permission', component: UtilQuickbookPermissionComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/quickbook-permission', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'quickbook/configuration', component: UtilQuickbookOnlineConfigurationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/quickbook/configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rf-configuration', component: UtilRfConfigurationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/util/rf-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilRoutingModule { }
