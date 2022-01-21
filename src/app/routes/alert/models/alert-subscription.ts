 
import { User } from "../../auth/models/user";
import { AlertDeliveryChannel } from "./alert-delivery-channel";
import { AlertType } from "./alert-type";

export interface AlertSubscription {
    
    id?: number;

    companyId: number;

    user: User;

    type: AlertType;
    deliveryChannel: AlertDeliveryChannel;

    subscribed?: boolean;

    keyWordsList?: string;
    keyWords?: string[];
}
