import { Client } from "../../common/models/client";
import { Customer } from "../../common/models/customer";  
import { ListPickConfigurationGroupRule } from "./list-pick-configuration-group-rule";
import { PickType } from "./pick-type.enum";

export interface ListPickConfiguration {
    
    id?: number;

    sequence?: number;

    warehouseId: number;
 
    clientId?: number;
    client?: Client;
    customerId?: number;
    customer?: Customer;
 

    pickType?: PickType;
    enabled: boolean;
    groupRules: ListPickConfigurationGroupRule[];

    
    maxVolume: number;
    maxVolumeUnit?: string;

    maxWeight: number;
    maxWeightUnit?: string;


    maxPickCount: number;

    maxQuantity: number;

    allowLPNPick?: boolean;

}
