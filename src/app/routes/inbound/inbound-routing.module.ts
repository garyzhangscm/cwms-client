import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InboundReceiptComponent } from './receipt/receipt.component';
import { InboundReceiptMaintenanceComponent } from './receipt-maintenance/receipt-maintenance.component';
import { InboundReceiptConfirmComponent } from './receipt-confirm/receipt-confirm.component';
import { InboundPutawayConfigurationComponent } from './putaway-configuration/putaway-configuration.component';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance/putaway-configuration-maintenance.component';
import { InboundPutawayConfigurationConfimComponent } from './putaway-configuration-confim/putaway-configuration-confim.component';

const routes: Routes = [

  { path: 'receipt', component: InboundReceiptComponent },
  { path: 'receipt-maintenance', component: InboundReceiptMaintenanceComponent },
  { path: 'receipt-confirm', component: InboundReceiptConfirmComponent },
  { path: 'putaway-configuration', component: InboundPutawayConfigurationComponent },
  { path: 'putaway-configuration-maintenance', component: InboundPutawayConfigurationMaintenanceComponent },
  { path: 'putaway-configuration-confim', component: InboundPutawayConfigurationConfimComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboundRoutingModule { }
