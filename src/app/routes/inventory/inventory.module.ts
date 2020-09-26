import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';
import { DirectivesModule } from '../directives/directives.module';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryInventoryComponent } from './inventory/inventory.component';
import { InventoryCycleCountComponent } from './cycle-count/cycle-count.component';
import { InventoryCountConfigComponent } from './count-config/count-config.component';
import { InventoryEmergencyReplenishmentConfigComponent } from './emergency-replenishment-config/emergency-replenishment-config.component';
import { InventoryReplenishmentComponent } from './replenishment/replenishment.component';
import { InventoryTriggerReplenishmentConfigComponent } from './trigger-replenishment-config/trigger-replenishment-config.component';
import { InventoryItemComponent } from './item/item.component';
import { InventoryItemFamilyComponent } from './item-family/item-family.component';
import { InventoryItemFamilyMaintenanceComponent } from './item-family-maintenance/item-family-maintenance.component';
import { InventoryItemFamilyMaintenanceConfirmComponent } from './item-family-maintenance-confirm/item-family-maintenance-confirm.component';
import { InventoryInventoryAdjustComponent } from './inventory-adjust/inventory-adjust.component';
import { InventoryInventoryAttributeChangeComponent } from './inventory-attribute-change/inventory-attribute-change.component';
import { InventoryInventoryAttributeChangeConfirmComponent } from './inventory-attribute-change-confirm/inventory-attribute-change-confirm.component';
import { InventoryCycleCountMaintenanceComponent } from './cycle-count-maintenance/cycle-count-maintenance.component';
import { InventoryAuditCountResultComponent } from './audit-count-result/audit-count-result.component';
import { InventoryAuditCountConfirmComponent } from './audit-count-confirm/audit-count-confirm.component';
import { InventoryMovementPathComponent } from './movement-path/movement-path.component';
import { InventoryMovementPathMaintenanceComponent } from './movement-path-maintenance/movement-path-maintenance.component';
import { InventoryMovementPathConfirmComponent } from './movement-path-confirm/movement-path-confirm.component';
import { InventoryInventoryQuantityChangeComponent } from './inventory-quantity-change/inventory-quantity-change.component';
import { InventoryInventoryQuantityChangeConfirmComponent } from './inventory-quantity-change-confirm/inventory-quantity-change-confirm.component';
import { InventoryInventoryActivityComponent } from './inventory-activity/inventory-activity.component';
import { InventoryInventoryMoveComponent } from './inventory-move/inventory-move.component';
import { InventoryInventoryAdjustmentRequestComponent } from './inventory-adjustment-request/inventory-adjustment-request.component';
import { InventoryInventoryAdjustmentThresholdComponent } from './inventory-adjustment-threshold/inventory-adjustment-threshold.component';
import { InventoryInventoryAdjustmentThresholdMaintenanceComponent } from './inventory-adjustment-threshold-maintenance/inventory-adjustment-threshold-maintenance.component';
import { InventoryInventoryAdjustmentThresholdConfirmComponent } from './inventory-adjustment-threshold-confirm/inventory-adjustment-threshold-confirm.component';
import { InventoryItemMaintenanceComponent } from './item-maintenance/item-maintenance.component';

const COMPONENTS = [
  InventoryInventoryComponent,
  InventoryCycleCountComponent,
  InventoryCountConfigComponent,
  InventoryEmergencyReplenishmentConfigComponent,
  InventoryReplenishmentComponent,
  InventoryTriggerReplenishmentConfigComponent,
  InventoryItemComponent,
  InventoryItemFamilyComponent,
  InventoryItemFamilyMaintenanceComponent,
  InventoryItemFamilyMaintenanceConfirmComponent,
  InventoryInventoryAdjustComponent,
  InventoryInventoryAttributeChangeComponent,
  InventoryInventoryAttributeChangeConfirmComponent,
  InventoryCycleCountMaintenanceComponent,
  InventoryAuditCountResultComponent,
  InventoryAuditCountConfirmComponent,
  InventoryMovementPathComponent,
  InventoryMovementPathMaintenanceComponent,
  InventoryMovementPathConfirmComponent,
  InventoryInventoryQuantityChangeComponent,
  InventoryInventoryQuantityChangeConfirmComponent,
  InventoryInventoryActivityComponent,
  InventoryInventoryMoveComponent,
  InventoryInventoryAdjustmentRequestComponent,
  InventoryInventoryAdjustmentThresholdComponent,
  InventoryInventoryAdjustmentThresholdMaintenanceComponent,
  InventoryInventoryAdjustmentThresholdConfirmComponent,
  InventoryItemMaintenanceComponent,
];
const COMPONENTS_NOROUNT = [];

@NgModule({
  imports: [SharedModule, InventoryRoutingModule, DirectivesModule],
  declarations: [...COMPONENTS, ...COMPONENTS_NOROUNT],
  entryComponents: COMPONENTS_NOROUNT,
})
export class InventoryModule {}
