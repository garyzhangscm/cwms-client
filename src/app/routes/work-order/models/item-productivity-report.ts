 

export interface ItemProductivityReport {
  
    warehouseId: number;
    
    itemName: string;
    itemFamilyName: string;

    productionLineNames: string[];

    realTimeGoal: number;
    actualPalletQuantity: number;
    actualQuantity: number;
    finishRate: number;

    estimatedFinishRate: number;
}
