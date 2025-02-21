import { Order } from "./order";
import { OrderCancellationRequestResult } from "./order-cancellation-request-result.enum";
 

export interface OrderCancellationRequest {
  id: number;
 
  warehouseId: number;
  order: Order;

  cancelRequestedTime: Date;
  cancelRequestedUsername: string;
  result: OrderCancellationRequestResult;
  message: string;
 
}
