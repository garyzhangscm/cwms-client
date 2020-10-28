import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/guard/auth.guard';
import { InventoryAuditCountConfirmComponent } from './audit-count-confirm/audit-count-confirm.component';
import { InventoryAuditCountResultComponent } from './audit-count-result/audit-count-result.component';
import { InventoryCountConfigComponent } from './count-config/count-config.component';
import { InventoryCycleCountMaintenanceComponent } from './cycle-count-maintenance/cycle-count-maintenance.component';
import { InventoryCycleCountComponent } from './cycle-count/cycle-count.component';
import { InventoryEmergencyReplenishmentConfigComponent } from './emergency-replenishment-config/emergency-replenishment-config.component';
import { InventoryInventoryActivityComponent } from './inventory-activity/inventory-activity.component';
import { InventoryInventoryAdjustComponent } from './inventory-adjust/inventory-adjust.component';
import { InventoryInventoryAdjustmentRequestComponent } from './inventory-adjustment-request/inventory-adjustment-request.component';
import { InventoryInventoryAdjustmentThresholdConfirmComponent } from './inventory-adjustment-threshold-confirm/inventory-adjustment-threshold-confirm.component';
import { InventoryInventoryAdjustmentThresholdMaintenanceComponent } from './inventory-adjustment-threshold-maintenance/inventory-adjustment-threshold-maintenance.component';
import { InventoryInventoryAdjustmentThresholdComponent } from './inventory-adjustment-threshold/inventory-adjustment-threshold.component';
import { InventoryInventoryAttributeChangeConfirmComponent } from './inventory-attribute-change-confirm/inventory-attribute-change-confirm.component';
import { InventoryInventoryAttributeChangeComponent } from './inventory-attribute-change/inventory-attribute-change.component';
import { InventoryInventoryMoveComponent } from './inventory-move/inventory-move.component';
import { InventoryInventoryQuantityChangeConfirmComponent } from './inventory-quantity-change-confirm/inventory-quantity-change-confirm.component';
import { InventoryInventoryQuantityChangeComponent } from './inventory-quantity-change/inventory-quantity-change.component';
import { InventoryInventoryComponent } from './inventory/inventory.component';
import { InventoryItemFamilyMaintenanceConfirmComponent } from './item-family-maintenance-confirm/item-family-maintenance-confirm.component';
import { InventoryItemFamilyMaintenanceComponent } from './item-family-maintenance/item-family-maintenance.component';
import { InventoryItemFamilyComponent } from './item-family/item-family.component';
import { InventoryItemMaintenanceComponent } from './item-maintenance/item-maintenance.component';
import { InventoryItemComponent } from './item/item.component';
import { InventoryMovementPathConfirmComponent } from './movement-path-confirm/movement-path-confirm.component';
import { InventoryMovementPathMaintenanceComponent } from './movement-path-maintenance/movement-path-maintenance.component';
import { InventoryMovementPathComponent } from './movement-path/movement-path.component';
import { InventoryReplenishmentComponent } from './replenishment/replenishment.component';
import { InventoryTriggerReplenishmentConfigComponent } from './trigger-replenishment-config/trigger-replenishment-config.component';

const routes: Routes = [
  { path: 'inventory', component: InventoryInventoryComponent, canActivate: [AuthGuard] },
  { path: 'count/config', component: InventoryCountConfigComponent },
  { path: 'count/cycle-count', component: InventoryCycleCountComponent, canActivate: [AuthGuard]  },
  { path: 'replenishment/emergency/config', component: InventoryEmergencyReplenishmentConfigComponent, canActivate: [AuthGuard]  },
  { path: 'replenishment/trigger/config', component: InventoryTriggerReplenishmentConfigComponent, canActivate: [AuthGuard]  },
  { path: 'replenishment', component: InventoryReplenishmentComponent, canActivate: [AuthGuard]  },
  { path: 'item', component: InventoryItemComponent, canActivate: [AuthGuard] },
  { path: 'item-family', component: InventoryItemFamilyComponent, canActivate: [AuthGuard] },
  { path: 'item-family-maintenance', component: InventoryItemFamilyMaintenanceComponent },
  { path: 'item-family-maintenance/confirm', component: InventoryItemFamilyMaintenanceConfirmComponent },
  { path: 'inventory-adjust', component: InventoryInventoryAdjustComponent, canActivate: [AuthGuard] },
  { path: 'inventory-attribute-change', component: InventoryInventoryAttributeChangeComponent },
  { path: 'inventory-attribute-change/confirm', component: InventoryInventoryAttributeChangeConfirmComponent },
  { path: 'count/cycle-count-maintenance', component: InventoryCycleCountMaintenanceComponent },
  { path: 'count/audit-count-result', component: InventoryAuditCountResultComponent },
  { path: 'count/audit-count-confirm', component: InventoryAuditCountConfirmComponent },
  { path: 'movement-path', component: InventoryMovementPathComponent, canActivate: [AuthGuard]  },
  { path: 'movement-path-maintenance', component: InventoryMovementPathMaintenanceComponent },
  { path: 'movement-path-confirm', component: InventoryMovementPathConfirmComponent },
  { path: 'inventory-quantity-change', component: InventoryInventoryQuantityChangeComponent },
  { path: 'inventory-quantity-change/confirm', component: InventoryInventoryQuantityChangeConfirmComponent },
  { path: 'inventory-activity', component: InventoryInventoryActivityComponent, canActivate: [AuthGuard]  },
  { path: 'inventory-move', component: InventoryInventoryMoveComponent },
  { path: 'inventory-adjustment-request', component: InventoryInventoryAdjustmentRequestComponent, canActivate: [AuthGuard]  },
  { path: 'inventory-adjustment-threshold', component: InventoryInventoryAdjustmentThresholdComponent, canActivate: [AuthGuard]  },
  {
    path: 'inventory-adjustment-threshold-maintenance',
    component: InventoryInventoryAdjustmentThresholdMaintenanceComponent,
  },
  { path: 'inventory-adjustment-threshold-confirm', component: InventoryInventoryAdjustmentThresholdConfirmComponent },
  { path: 'item/maintenance', component: InventoryItemMaintenanceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
