export interface SiloConfiguration {
    id?: number;
    warehouseId: number;
 
    webAPIProtocol: string; 
    webAPIUrl: string;
    webAPIUsername: string;
    webAPIPassword: string;
    enabled: boolean;
    inventoryInformationFromWMS: boolean;
}
