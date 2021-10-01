import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../auth/guard/auth.guard';
import { InboundInboundQcConfigurationMaintenanceComponent } from './inbound-qc-configuration-maintenance/inbound-qc-configuration-maintenance.component';
import { InboundInboundQcConfigurationComponent } from './inbound-qc-configuration/inbound-qc-configuration.component';
import { InboundPutawayConfigurationConfimComponent } from './putaway-configuration-confim/putaway-configuration-confim.component';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance/putaway-configuration-maintenance.component';
import { InboundPutawayConfigurationComponent } from './putaway-configuration/putaway-configuration.component';
import { InboundReceiptConfirmComponent } from './receipt-confirm/receipt-confirm.component';
import { InboundReceiptMaintenanceComponent } from './receipt-maintenance/receipt-maintenance.component';
import { InboundReceiptComponent } from './receipt/receipt.component';

const routes: Routes = [

  { path: 'receipt', component: InboundReceiptComponent, canActivate: [AuthGuard]  },
  { path: 'receipt-maintenance', component: InboundReceiptMaintenanceComponent },
  { path: 'receipt-confirm', component: InboundReceiptConfirmComponent },
  { path: 'putaway-configuration', component: InboundPutawayConfigurationComponent, canActivate: [AuthGuard]  },
  { path: 'putaway-configuration-maintenance', component: InboundPutawayConfigurationMaintenanceComponent },
  { path: 'putaway-configuration-confim', component: InboundPutawayConfigurationConfimComponent },
  { path: 'inbound-qc-configuration', component: InboundInboundQcConfigurationComponent },
  { path: 'inbound-qc-configuration/maintenance', component: InboundInboundQcConfigurationMaintenanceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboundRoutingModule { }
