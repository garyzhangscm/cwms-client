import { DatePipe } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { EllipsisModule } from '@delon/abc/ellipsis';
import { STModule } from '@delon/abc/st'; 
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzTransferModule } from 'ng-zorro-antd/transfer';

import { CWMSCommonModule } from '../common/common.module';
import { DirectivesModule } from '../directives/directives.module';  
import { UtilModule } from '../util/util.module';
import { WarehouseLayoutModule } from '../warehouse-layout/warehouse-layout.module'; 
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
import { InventoryRoutingModule } from './inventory-routing.module';
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


const COMPONENTS: Array<Type<void>> = [
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
  InventoryItemQueryPopupComponent,
  InventoryInventoryConfigurationComponent,
  InventoryInventorySnapshotComponent,
  InventoryInventorySnapshotConfigurationComponent,
  InventoryInventoryAllocationSummaryComponent,
  InventoryItemSamplingComponent,
  InventoryItemSamplingMaintenanceComponent,
  InventoryLockComponent,
  InventoryLockMaintenanceComponent,
  InventoryLocationUtilizationSnapshotComponent,
  InventoryInventoryStatusComponent,
  InventoryInventoryStatusMaintenanceComponent,
  InventoryInventoryDashboardComponent,
  InventoryInventoryMixRestrictionComponent,
  InventoryInventoryMixRestrictionMaintenanceComponent,
  InventoryInventoryAgingSnapshotComponent, 
  InventoryDryrunInventoryAllocationComponent,
  InventoryItemBarcodeTypeComponent];
const COMPONENTS_NOROUNT: Array<Type<void>> = [];

@NgModule({
  imports: [ 
    InventoryRoutingModule,
    DirectivesModule,
    NzDescriptionsModule,
    WarehouseLayoutModule,
    NzImageModule,
    CWMSCommonModule,
    NzStepsModule, 
    UtilModule,
    NzSkeletonModule,NzIconModule ,
    EllipsisModule,
    NzResultModule,    
    NzTransferModule,
    STModule, NzButtonModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_NOROUNT
  ],
  providers: [DatePipe],
  exports: [InventoryItemQueryPopupComponent],
})
export class InventoryModule { }
