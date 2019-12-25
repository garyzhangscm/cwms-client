import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryInventoryComponent } from './inventory/inventory.component';
import { InventoryCountConfigComponent } from './count-config/count-config.component';
import { InventoryCycleCountComponent } from './cycle-count/cycle-count.component';
import { InventoryEmergencyReplenishmentConfigComponent } from './emergency-replenishment-config/emergency-replenishment-config.component';
import { InventoryReplenishmentComponent } from './replenishment/replenishment.component';
import { InventoryTriggerReplenishmentConfigComponent } from './trigger-replenishment-config/trigger-replenishment-config.component';
import { InventoryItemComponent } from './item/item.component';
import { InventoryItemFamilyComponent } from './item-family/item-family.component';
import { InventoryItemFamilyMaintenanceComponent } from './item-family-maintenance/item-family-maintenance.component';
import { InventoryItemFamilyMaintenanceConfirmComponent } from './item-family-maintenance-confirm/item-family-maintenance-confirm.component';
import { InventoryInventoryAdjustComponent } from './inventory-adjust/inventory-adjust.component';
import { InventoryInventoryAdjustConfirmComponent } from './inventory-adjust-confirm/inventory-adjust-confirm.component';
import { InventoryInventoryAttributeChangeComponent } from './inventory-attribute-change/inventory-attribute-change.component';
import { InventoryInventoryAttributeChangeConfirmComponent } from './inventory-attribute-change-confirm/inventory-attribute-change-confirm.component';
import { InventoryCycleCountMaintenanceComponent } from './cycle-count-maintenance/cycle-count-maintenance.component';
import { InventoryAuditCountResultComponent } from './audit-count-result/audit-count-result.component';
import { InventoryAuditCountConfirmComponent } from './audit-count-confirm/audit-count-confirm.component';

const routes: Routes = [
  { path: 'inventory', component: InventoryInventoryComponent },
  { path: 'count/config', component: InventoryCountConfigComponent },
  { path: 'count/cycle-count', component: InventoryCycleCountComponent },
  { path: 'replenishment/emergency/config', component: InventoryEmergencyReplenishmentConfigComponent },
  { path: 'replenishment/trigger/config', component: InventoryTriggerReplenishmentConfigComponent },
  { path: 'replenishment', component: InventoryReplenishmentComponent },
  { path: 'item', component: InventoryItemComponent },
  { path: 'item-family', component: InventoryItemFamilyComponent },
  { path: 'item-family-maintenance', component: InventoryItemFamilyMaintenanceComponent },
  { path: 'item-family-maintenance/confirm', component: InventoryItemFamilyMaintenanceConfirmComponent },
  { path: 'inventory-adjust', component: InventoryInventoryAdjustComponent },
  { path: 'inventory-adjust/confirm', component: InventoryInventoryAdjustConfirmComponent },
  { path: 'inventory-attribute-change', component: InventoryInventoryAttributeChangeComponent },
  { path: 'inventory-attribute-change/confirm', component: InventoryInventoryAttributeChangeConfirmComponent },
  { path: 'count/cycle-count-maintenance', component: InventoryCycleCountMaintenanceComponent },
  { path: 'count/audit-count-result', component: InventoryAuditCountResultComponent },
  { path: 'count/audit-count-confirm', component: InventoryAuditCountConfirmComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
