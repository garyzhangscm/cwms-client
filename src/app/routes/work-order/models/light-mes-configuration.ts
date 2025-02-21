export interface LightMesConfiguration {
    
    id?: number;
    warehouseId: number;  

    protocol?: string;    
    host?: string;
    port?: string;

    accessKeyId?: string;
    accessKeySecret?: string;

    singleLightStatusQueryUrl?: string;
    batchLightStatusQueryUrl?: string;
    singleLightPulseQueryUrl?: string;
    singleMachineDetailQueryUrl?: string;
    machineListQueryUrl?: string;

    timeZone?: string;
    cycleTimeWindow?: number;
}
