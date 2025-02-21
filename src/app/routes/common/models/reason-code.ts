import { ReasonCodeType } from './reason-code-type.enum';

export interface ReasonCode {
  id?: number;
  warehouseId?: number;
  name: string;
  description: string;
  type?: ReasonCodeType;
}
