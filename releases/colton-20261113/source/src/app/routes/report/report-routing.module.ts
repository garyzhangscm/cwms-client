import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  aclCanActivate, ACLGuardType } from '@delon/acl';

import { ReportPrinterMaintenanceComponent } from './printer-maintenance/printer-maintenance.component';
import { ReportPrinterTypeMaintenanceComponent } from './printer-type-maintenance/printer-type-maintenance.component';
import { ReportPrinterTypeComponent } from './printer-type/printer-type.component';
import { ReportPrinterComponent } from './printer/printer.component';
import { ReportReportHistoryComponent } from './report-history/report-history.component';
import { ReportReportMaintenanceComponent } from './report-maintenance/report-maintenance.component';
import { ReportReportPreviewComponent } from './report-preview/report-preview.component';
import { ReportReportPrinterConfigurationMaintenanceComponent } from './report-printer-configuration-maintenance/report-printer-configuration-maintenance.component';
import { ReportReportPrinterConfigurationComponent } from './report-printer-configuration/report-printer-configuration.component';
import { ReportReportComponent } from './report/report.component';

const routes: Routes = [

  { path: 'report', component: ReportReportComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/report', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'report-history', component: ReportReportHistoryComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/report-history', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'report-preview', component: ReportReportPreviewComponent   
  },
  { path: 'report-maintenance', component: ReportReportMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/report-maintenance', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'report-printer-configuration', component: ReportReportPrinterConfigurationComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/report-printer-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'report-printer-configuration/maintenance', component: ReportReportPrinterConfigurationMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/report-printer-configuration', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'printer', component: ReportPrinterComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/printer', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'printer/maintenance', component: ReportPrinterMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/printer', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'printer-type', component: ReportPrinterTypeComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/printer-type', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'printer-type/maintenance', component: ReportPrinterTypeMaintenanceComponent   , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/report/printer-type', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
