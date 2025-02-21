export interface Company {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  description: string;
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

  apiKey?: string;
  apiSecret?: string;
}
