export interface Supplier {
  id?: number;
  warehouseId?: number,
  companyId: number,
  name: string;
  description: string;
  contactorFirstname: string;
  contactorLastname: string;
  addressCountry: string;
  addressState: string;
  addressCounty?: string;
  addressCity: string;
  addressDistrict?: string;
  addressLine1: string;
  addressLine2?: string;
  addressPostcode: string;
}
