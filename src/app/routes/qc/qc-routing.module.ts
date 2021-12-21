import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QcInspectInventoryComponent } from './inspect-inventory/inspect-inventory.component';
import { QcQcConfigurationComponent } from './qc-configuration/qc-configuration.component';
import { QcQcInspectionRequestMaintenanceComponent } from './qc-inspection-request-maintenance/qc-inspection-request-maintenance.component';
import { QcQcInspectionComponent } from './qc-inspection/qc-inspection.component';
import { QcQcResultComponent } from './qc-result/qc-result.component';
import { QcQcRuleConfigurationMaintenanceComponent } from './qc-rule-configuration-maintenance/qc-rule-configuration-maintenance.component';
import { QcQcRuleConfigurationComponent } from './qc-rule-configuration/qc-rule-configuration.component';
import { QcQcRuleMaintenanceComponent } from './qc-rule-maintenance/qc-rule-maintenance.component';
import { QcQcRuleComponent } from './qc-rule/qc-rule.component';
import { QcInspectByRequestComponent } from './inspect-by-request/inspect-by-request.component';

const routes: Routes = [

  { path: 'rules', component: QcQcRuleComponent },
  { path: 'configuration', component: QcQcConfigurationComponent },
  { path: 'inspection', component: QcQcInspectionComponent },
  { path: 'rules/configuration', component: QcQcRuleConfigurationComponent },
  { path: 'qc-rule/maintenance', component: QcQcRuleMaintenanceComponent },
  { path: 'qc-rule-configuration/maintenance', component: QcQcRuleConfigurationMaintenanceComponent },
  { path: 'inspect-inventory', component: QcInspectInventoryComponent },
  { path: 'result', component: QcQcResultComponent },
  { path: 'qc-inspection-request/maintenance', component: QcQcInspectionRequestMaintenanceComponent },
  { path: 'inspect-by-request', component: QcInspectByRequestComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QcRoutingModule { }
