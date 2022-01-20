import { IntegrationStatus } from "./integration-status.enum";

export interface IntegrationWorkOrderInstruction {
    id: number;
    
    sequence: number;

    instruction: string;
 

    status: IntegrationStatus;
    errorMessage: string;
}
