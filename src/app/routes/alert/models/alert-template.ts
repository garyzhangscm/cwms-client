import { AlertDeliveryChannel } from "./alert-delivery-channel";
import { AlertType } from "./alert-type";

export interface AlertTemplate {
    id?: number;

    companyId: number;

    type?: AlertType;

    deliveryChannel?: AlertDeliveryChannel;

    template: string;
}
