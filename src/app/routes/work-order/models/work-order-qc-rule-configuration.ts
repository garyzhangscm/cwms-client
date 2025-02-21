import { Customer } from "../../common/models/customer";
import { InventoryLock } from "../../inventory/models/inventory-lock";
import { InventoryStatus } from "../../inventory/models/inventory-status";
import { Item } from "../../inventory/models/item";
import { ItemFamily } from "../../inventory/models/item-family";
import { Order } from "../../outbound/models/order";
import { QCRule } from "../../qc/models/qc-rule";
import { Warehouse } from "../../warehouse-layout/models/warehouse";
import { ProductionLine } from "./production-line";
import { WorkOrder } from "./work-order";
import { WorkOrderQcRuleConfigurationRule } from "./work-order-qc-rule-configuration-rule";

export interface WorkOrderQcRuleConfiguration {
 
    id?: number;
    workOrderQCRuleConfigurationRules: WorkOrderQcRuleConfigurationRule[];
    warehouseId?: number;
    warehouse?: Warehouse;
    productionLine?: ProductionLine;
    workOrder?: WorkOrder;
    qcQuantity?: number;

    
    companyId: number;
    itemFamilyId?: number;
    itemFamily?: ItemFamily;
    itemId?: number;
    item?: Item;
    outboundOrderId?: number;
    outboundOrder?: Order;
    customerId?: number;
    customer?: Customer;


    qcQuantityPerWorkOrder?: number;
    qcPercentagePerWorkOrder?: number;

    fromInventoryStatusId?: number;
    fromInventoryStatus?: InventoryStatus;

    
    toInventoryStatusId?: number;
    toInventoryStatus?: InventoryStatus;

    inventoryLockId?: number;
    inventoryLock?: InventoryLock;

    futureInventoryLockId?: number;
    futureInventoryLock?: InventoryLock;

}
