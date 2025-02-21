export interface InventoryStatus {
  id?: number;
  warehouseId: number;
  name: string;
  description: string;
  availableStatusFlag?: boolean;

  
  reasonRequiredWhenReceiving?: boolean; 
  reasonRequiredWhenProducing?: boolean;
  reasonRequiredWhenAdjusting?: boolean;

  reasonOptionalWhenReceiving?: boolean;
  reasonOptionalWhenProducing?: boolean;
  reasonOptionalWhenAdjusting?: boolean;
}
