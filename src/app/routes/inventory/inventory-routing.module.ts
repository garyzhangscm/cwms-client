import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {  aclCanActivate, ACLGuardType } from '@delon/acl';
 
import { InventoryAuditCountConfirmComponent } from './audit-count-confirm/audit-count-confirm.component';
import { InventoryAuditCountResultComponent } from './audit-count-result/audit-count-result.component';
import { InventoryCountConfigComponent } from './count-config/count-config.component';
import { InventoryCycleCountMaintenanceComponent } from './cycle-count-maintenance/cycle-count-maintenance.component';
import { InventoryCycleCountComponent } from './cycle-count/cycle-count.component';
import { InventoryDryrunInventoryAllocationComponent } from './dryrun-inventory-allocation/dryrun-inventory-allocation.component';
import { InventoryEmergencyReplenishmentConfigComponent } from './emergency-replenishment-config/emergency-replenishment-config.component';
import { InventoryInventoryActivityComponent } from './inventory-activity/inventory-activity.component';
import { InventoryInventoryAdjustComponent } from './inventory-adjust/inventory-adjust.component';
import { InventoryInventoryAdjustmentRequestComponent } from './inventory-adjustment-request/inventory-adjustment-request.component';
import { InventoryInventoryAdjustmentThresholdConfirmComponent } from './inventory-adjustment-threshold-confirm/inventory-adjustment-threshold-confirm.component';
import { InventoryInventoryAdjustmentThresholdMaintenanceComponent } from './inventory-adjustment-threshold-maintenance/inventory-adjustment-threshold-maintenance.component';
import { InventoryInventoryAdjustmentThresholdComponent } from './inventory-adjustment-threshold/inventory-adjustment-threshold.component';
import { InventoryInventoryAgingSnapshotComponent } from './inventory-aging-snapshot/inventory-aging-snapshot.component';
import { InventoryInventoryAllocationSummaryComponent } from './inventory-allocation-summary/inventory-allocation-summary.component';
import { InventoryInventoryAttributeChangeConfirmComponent } from './inventory-attribute-change-confirm/inventory-attribute-change-confirm.component';
import { InventoryInventoryAttributeChangeComponent } from './inventory-attribute-change/inventory-attribute-change.component';
import { InventoryInventoryConfigurationComponent } from './inventory-configuration/inventory-configuration.component';
import { InventoryInventoryDashboardComponent } from './inventory-dashboard/inventory-dashboard.component';
import { InventoryInventoryMixRestrictionMaintenanceComponent } from './inventory-mix-restriction-maintenance/inventory-mix-restriction-maintenance.component';
import { InventoryInventoryMixRestrictionComponent } from './inventory-mix-restriction/inventory-mix-restriction.component';
import { InventoryInventoryMoveComponent } from './inventory-move/inventory-move.component';
import { InventoryInventoryQuantityChangeConfirmComponent } from './inventory-quantity-change-confirm/inventory-quantity-change-confirm.component';
import { InventoryInventoryQuantityChangeComponent } from './inventory-quantity-change/inventory-quantity-change.component';
import { InventoryInventorySnapshotConfigurationComponent } from './inventory-snapshot-configuration/inventory-snapshot-configuration.component';
import { InventoryInventorySnapshotComponent } from './inventory-snapshot/inventory-snapshot.component';
import { InventoryInventoryStatusMaintenanceComponent } from './inventory-status-maintenance/inventory-status-maintenance.component';
import { InventoryInventoryStatusComponent } from './inventory-status/inventory-status.component';
import { InventoryInventoryComponent } from './inventory/inventory.component';
import { InventoryItemFamilyMaintenanceConfirmComponent } from './item-family-maintenance-confirm/item-family-maintenance-confirm.component';
import { InventoryItemFamilyMaintenanceComponent } from './item-family-maintenance/item-family-maintenance.component';
import { InventoryItemFamilyComponent } from './item-family/item-family.component';
import { InventoryItemMaintenanceComponent } from './item-maintenance/item-maintenance.component';
import { InventoryItemQueryPopupComponent } from './item-query-popup/item-query-popup.component';
import { InventoryItemSamplingMaintenanceComponent } from './item-sampling-maintenance/item-sampling-maintenance.component';
import { InventoryItemSamplingComponent } from './item-sampling/item-sampling.component';
import { InventoryItemComponent } from './item/item.component';
import { InventoryLocationUtilizationSnapshotComponent } from './location-utilization-snapshot/location-utilization-snapshot.component';
import { InventoryLockMaintenanceComponent } from './lock-maintenance/lock-maintenance.component';
import { InventoryLockComponent } from './lock/lock.component';
import { InventoryMovementPathConfirmComponent } from './movement-path-confirm/movement-path-confirm.component';
import { InventoryMovementPathMaintenanceComponent } from './movement-path-maintenance/movement-path-maintenance.component';
import { InventoryMovementPathComponent } from './movement-path/movement-path.component';
import { InventoryReplenishmentComponent } from './replenishment/replenishment.component';
import { InventoryTriggerReplenishmentConfigComponent } from './trigger-replenishment-config/trigger-replenishment-config.component';
import { InventoryItemBarcodeTypeComponent } from './item-barcode-type/item-barcode-type.component';

const routes: Routes = [
  { path: 'inventory', component: InventoryInventoryComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'count/config', component: InventoryCountConfigComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/count/config', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'count/cycle-count', component: InventoryCycleCountComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/count/cycle-count' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'replenishment/emergency/config', component: InventoryEmergencyReplenishmentConfigComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/replenishment/emergency/config' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'replenishment/trigger/config', component: InventoryTriggerReplenishmentConfigComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/replenishment/trigger/config', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'replenishment', component: InventoryReplenishmentComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/replenishment' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item', component: InventoryItemComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item-family', component: InventoryItemFamilyComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item-family' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item-family-maintenance', component: InventoryItemFamilyMaintenanceComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item-family', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item-family-maintenance/confirm', component: InventoryItemFamilyMaintenanceConfirmComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item-family', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-adjust', component: InventoryInventoryAdjustComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-adjust' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-attribute-change', component: InventoryInventoryAttributeChangeComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-attribute-change/confirm', component: InventoryInventoryAttributeChangeConfirmComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'count/cycle-count-maintenance', component: InventoryCycleCountMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/count/cycle-count-maintenance', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'count/audit-count-result', component: InventoryAuditCountResultComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/count/cycle-count' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'count/audit-count-confirm', component: InventoryAuditCountConfirmComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/count/cycle-count' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'movement-path', component: InventoryMovementPathComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/movement-path' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'movement-path-maintenance', component: InventoryMovementPathMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/movement-path' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'movement-path-confirm', component: InventoryMovementPathConfirmComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/movement-path', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-quantity-change', component: InventoryInventoryQuantityChangeComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-quantity-change/confirm', component: InventoryInventoryQuantityChangeConfirmComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-activity', component: InventoryInventoryActivityComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-activity' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-move', component: InventoryInventoryMoveComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory' , '/inventory/inventory-move', 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-adjustment-request', component: InventoryInventoryAdjustmentRequestComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-adjustment-request', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-adjustment-threshold', component: InventoryInventoryAdjustmentThresholdComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-adjustment-threshold' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  {
    path: 'inventory-adjustment-threshold-maintenance',
    component: InventoryInventoryAdjustmentThresholdMaintenanceComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-adjustment-threshold', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-adjustment-threshold-confirm', component: InventoryInventoryAdjustmentThresholdConfirmComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-adjustment-threshold' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item/maintenance', component: InventoryItemMaintenanceComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item-query-popup', component: InventoryItemQueryPopupComponent,  
  },
  { path: 'configuration', component: InventoryInventoryConfigurationComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'snapshot', component: InventoryInventorySnapshotComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/snapshot' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-snapshot-configuration', component: InventoryInventorySnapshotConfigurationComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-snapshot-configuration', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-allocation-summary', component: InventoryInventoryAllocationSummaryComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-allocation-summary' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item-sampling', component: InventoryItemSamplingComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item-sampling' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'item-sampling/maintenance', component: InventoryItemSamplingMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item-sampling', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'lock', component: InventoryLockComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/lock' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'lock/maintenance', component: InventoryLockMaintenanceComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/lock' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'location-utilization-snapshot', component: InventoryLocationUtilizationSnapshotComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/location-utilization-snapshot', 'admin', 'system-admin'  ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'status', component: InventoryInventoryStatusComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/status' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'status/maintenance', component: InventoryInventoryStatusMaintenanceComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/status' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'inventory-dashboard', component: InventoryInventoryDashboardComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-dashboard' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'mix-restriction', component: InventoryInventoryMixRestrictionComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/mix-restriction' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  },
  { path: 'mix-restriction/maintenance', component: InventoryInventoryMixRestrictionMaintenanceComponent, 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/mix-restriction' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'inventory-aging-snapshot', component: InventoryInventoryAgingSnapshotComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/inventory-aging-snapshot' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }, 
  { path: 'dryrun-inventory-allocation', component: InventoryDryrunInventoryAllocationComponent },
  { path: 'item-barcode-type', component: InventoryItemBarcodeTypeComponent , 
    canActivate: [aclCanActivate], 
    data: { 
      guard:  {
        role: [ '/inventory/item-barcode-type' , 'admin', 'system-admin' ], 
      } as ACLGuardType,
      guard_url: '/exception/403'
    }
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
