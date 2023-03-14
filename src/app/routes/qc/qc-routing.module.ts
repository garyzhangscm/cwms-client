import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ACLGuard, ACLGuardType } from '@delon/acl';

import { QcInspectByRequestComponent } from './inspect-by-request/inspect-by-request.component';
import { QcInspectInventoryComponent } from './inspect-inventory/inspect-inventory.component';
import { QcQcConfigurationComponent } from './qc-configuration/qc-configuration.component';
import { QcQcInspectionDocumentMaintenanceComponent } from './qc-inspection-document-maintenance/qc-inspection-document-maintenance.component';
import { QcQcInspectionRequestMaintenanceComponent } from './qc-inspection-request-maintenance/qc-inspection-request-maintenance.component';
import { QcQcInspectionComponent } from './qc-inspection/qc-inspection.component';
import { QcQcResultComponent } from './qc-result/qc-result.component';
import { QcQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance/qc-rule-configuration-maintenance.component';
import { QcQcRuleConfigurationComponent } from './qc-rule-configuration/qc-rule-configuration.component';
import { QcQcRuleMaintenanceComponent } from './qc-rule-maintenance/qc-rule-maintenance.component';
import { QcQcRuleComponent } from './qc-rule/qc-rule.component';

const routes: Routes = [

  { path: 'rules', component: QcQcRuleComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/rules' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'configuration', component: QcQcConfigurationComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inspection', component: QcQcInspectionComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/inspection' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rules/configuration', component: QcQcRuleConfigurationComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/rules/configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'qc-rule/maintenance', component: QcQcRuleMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/qc-rule/maintenance' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'qc-rule-configuration/maintenance', component: QcQcRuleConfigurationMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/qc-rule-configuration/maintenance', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inspect-inventory', component: QcInspectInventoryComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/inspect-inventory', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'result', component: QcQcResultComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/result' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'qc-inspection-request/maintenance', component: QcQcInspectionRequestMaintenanceComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/qc-inspection-request/maintenance' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inspect-by-request', component: QcInspectByRequestComponent  , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/inspect-by-request', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inspection-document/maintenance', component: QcQcInspectionDocumentMaintenanceComponent , 
    canActivate: [ACLGuard], 
    data: { 
      guard:  {
        role: [ '/qc/inspection-document/maintenance', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QcRoutingModule { }
