import { TrailerAppointment } from '../../transportation/models/trailer-appointment';
import { Shipment } from './shipment';
import { StopStatus } from './stop-status.enum';

export interface Stop {
  id: number;
  shipments: Shipment[];
  number: string;

  sequence: number;
  trailerAppointmentId: number;

  trailerAppointment: TrailerAppointment;

  contactorFirstname: string;
  contactorLastname: string;

  addressCountry: string;
  addressState: string;
  addressCounty: string;
  addressCity: string;
  addressDistrict: string;
  addressLine1: string;
  addressLine2: string;
  addressPostcode: string;
  status: StopStatus;

  shipmentCount?: number;
  orderCount?: number;

}
