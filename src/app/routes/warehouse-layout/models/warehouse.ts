 

export interface Warehouse {
  id: number;
  name: string;
  size: string;
  companyId: number;

  
  contactorFirstname?: string;
  contactorLastname?: string;

  addressLine1: string;
  addressLine2?: string;
  addressCountry: string;
  addressState: string;
  addressCounty?: string;
  addressCity: string;
  addressDistrict?: string;
  addressPostcode: string; 
  addressPhone?: string;

  timeZone?: string;
}
