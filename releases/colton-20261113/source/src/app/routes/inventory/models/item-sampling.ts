import { Item } from "./item";

export interface ItemSampling {
    
    id?: number;

    number: string;
    description: string;
    warehouseId: number;

    imageUrls: string;

    item?: Item;

    enabled: boolean;
}
