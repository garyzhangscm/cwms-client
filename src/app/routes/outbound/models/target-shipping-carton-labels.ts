 

export interface TargetShippnigCartonLabel {
  
  id: number;
  warehouseId: number;

  partnerID: string;
  docType: string;
  poNumber: string;
  poDate: string;
  
  shipToName: string;
  address1: string;
  cityStateZip: string;
  zip420: string;

  lineItemNumber: string;
  UOM: string;

  pieceCarton: string;
  itemNumber: string;
  customerSKU: string;


  UPC: string;
  SSCC18: string;
  weight: string;
  
  shippedQuantity: string;
  orderQuantity: string;

  shipDate: string;
  BOL: string;
  SCAC: string;
  freightType: string;
  shipId: string;
  dpciDashed: string;
  dpci: string;
  
  GTIN: string;
  
}
