import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryInventoryComponent } from './inventory/inventory.component';
import { InventoryInventoryAdjustComponent } from './inventory-adjust/inventory-adjust.component';
import { InventoryCountConfigComponent } from './count-config/count-config.component';
import { InventoryCycleCountComponent } from './cycle-count/cycle-count.component';
import { InventoryEmergencyReplenishmentConfigComponent } from './emergency-replenishment-config/emergency-replenishment-config.component';
import { InventoryReplenishmentComponent } from './replenishment/replenishment.component';
import { InventoryTriggerReplenishmentConfigComponent } from './trigger-replenishment-config/trigger-replenishment-config.component';
import { InventoryItemComponent } from './item/item.component';
import { InventoryItemFamilyComponent } from './item-family/item-family.component';

const routes: Routes = [
  { path: 'inventory', component: InventoryInventoryComponent },
  { path: 'inventory-adjust', component: InventoryInventoryAdjustComponent },
  { path: 'count/config', component: InventoryCountConfigComponent },
  { path: 'count/cycle-count', component: InventoryCycleCountComponent },
  { path: 'replenishment/emergency/config', component: InventoryEmergencyReplenishmentConfigComponent },
  { path: 'replenishment/trigger/config', component: InventoryTriggerReplenishmentConfigComponent },
  { path: 'replenishment', component: InventoryReplenishmentComponent },
  { path: 'item', component: InventoryItemComponent },
  { path: 'item-family', component: InventoryItemFamilyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InventoryRoutingModule {}
