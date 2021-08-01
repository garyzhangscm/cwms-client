export interface LocationGroupType {
  id: number;
  name: string;
  description: string;
  fourWallInventory: boolean;
  virtual: boolean;
  receivingStage?: boolean;
  shippingStage?: boolean;
  productionLine?: boolean;
  productionLineInbound?: boolean;
  productionLineOutbound?: boolean;
  dock?: boolean;
  yard?: boolean;
  storage?: boolean;
  pickupAndDeposit?: boolean;
  trailer?: boolean;
}
