import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  aclCanActivate, ACLGuardType } from '@delon/acl';

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
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/qc/rules' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'configuration', component: QcQcConfigurationComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/qc/configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inspection', component: QcQcInspectionComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/qc/inspection' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'rules/configuration', component: QcQcRuleConfigurationComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/qc/rules/configuration' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'qc-rule/maintenance', component: QcQcRuleMaintenanceComponent  ,  
  },
  { path: 'qc-rule-configuration/maintenance', component: QcQcRuleConfigurationMaintenanceComponent  ,  
  },
  { path: 'inspect-inventory', component: QcInspectInventoryComponent  ,  
  },
  { path: 'result', component: QcQcResultComponent  , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/qc/result' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'qc-inspection-request/maintenance', component: QcQcInspectionRequestMaintenanceComponent  , 
  },
  { path: 'inspect-by-request', component: QcInspectByRequestComponent  ,  
  },
  { path: 'inspection-document/maintenance', component: QcQcInspectionDocumentMaintenanceComponent ,  
  },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QcRoutingModule { }
