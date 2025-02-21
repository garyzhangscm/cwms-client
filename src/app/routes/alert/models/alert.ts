import { AlertStatus } from "./alert-status";
import { AlertType } from "./alert-type";

export interface Alert {
    
    id?: number;

    companyId: number;

    type: AlertType;

    keyWords: string;
    title: string;

    message: string;
    errorMessage: string;

    status: AlertStatus;
    
    createdTime:  Date;
    lastSentTime:  Date;
}
