import { MachineStatistics } from "./machine-statistics";

export interface Machine {
    
    mid : string;
    machineNo : string;
    machineName : string;

    sim : string;

    status : number;

    currentState : string;
    machineStatistics: MachineStatistics[];
     

    machineBrand : string;
    machineModel : string;
    machineFunction : string;
    machineImage : string;
    serialNumber : string;
    fixedAssetsCode : string;
    supplier : string;
    manufacturer : string;
    productionDate : string;
    receiveDate : string;
    firstDate : string;
    documents : string;
    useTime : string;

    
    lastTimeWindowPulseCount: number;
    lastTimeWindowCycleTime: number;
    pulseCount: number;
    cycleTime: number;
    
}
