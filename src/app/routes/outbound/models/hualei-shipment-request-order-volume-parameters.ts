export interface HualeiShipmentRequestOrderVolumeParameters {
    
    id?: number;
    warehouseId: number;

    box_no: string;
    child_no: string;
    volume_height: number;
    volume_length: number;
    volume_width: number;
    volume_weight: number;

    length_unit: string;
    weight_unit: string;
}
