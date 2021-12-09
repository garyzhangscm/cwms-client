export enum DataTransferRequestTable {
    
    WAREHOUSE='WAREHOUSE',
    POLICY='POLICY',
    SYSTEM_CONTROLLED_NUMBER='SYSTEM_CONTROLLED_NUMBER',
    LOCATION_GROUP='LOCATION_GROUP',
    LOCATION='LOCATION',
    UNIT_OF_MEASURE='UNIT_OF_MEASURE',
    CUSTOMER='CUSTOMER',
    SUPPLIER='SUPPLIER',
    INVENTORY_STATUS='INVENTORY_STATUS',
    ITEM_FAMILY='ITEM_FAMILY',
    ITEM='ITEM',        // Include item / item package type / item unit of measure
    INVENTORY_CONFIGURATION='INVENTORY_CONFIGURATION',
    INVENTORY='INVENTORY',
    RECEIPT='RECEIPT',
    OUTBOUND_ORDER='OUTBOUND_ORDER',   // include outbound order and picks and short allocations and etc.
    CYCLE_COUNT='CYCLE_COUNT',   // include cycle count / audit count / cycle count result / audit count result
}
