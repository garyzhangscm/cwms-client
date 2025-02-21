export interface HualeiShipmentRequestOrderInvoiceParameters {
    
    id?: number;
    warehouseId: number;

    box_no: string;
    hs_code: string;
    invoice_amount: number;
    invoice_pcs: number;
    invoice_title: string;
    invoice_weight: number;
    sku: string;
    sku_code: string;
    weight_unit: string;
}
