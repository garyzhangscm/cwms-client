import { HttpUrlEncodingCodec } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { Supplier } from '../../common/models/supplier';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private warehouseService: WarehouseService, 
    private companyService: CompanyService) { }

  // a helper function to compare 2 date times. When 
  // the date time returned from server is a LocalDateTime, then
  // in the angular, we will get a number array of 6 items
  // index                value
  // 0                    year
  // 1                    month
  // 2                    day
  // 3                    hour
  // 4                    minute
  // 5                    second

  /**
   * 
  compareDateTime(dateTime1: number[], dateTime2: number[]): number{

    const indexList = [0, 1, 2, 3, 4, 5];
    for (let i = 0; i < indexList.length; i++) { 
      if (dateTime1[i] !== dateTime2[i]) {
        return dateTime1[i] - dateTime2[i];
      }
    }
    return 0;  
  } 
   */
  compareDateTime(dateTime1: Date, dateTime2: Date): number{

    if (dateTime1.getTime() < dateTime2.getTime())  {

      return -1;
    }
    else if (dateTime1.getTime() > dateTime2.getTime())  {
      return 1;
    }
    return 0;  
  } 
  compareNullableDateTime(dateTime1?: Date, dateTime2?: Date): number{

    if (dateTime1 === undefined || dateTime1 === null) {
      return -1;
    }
    else  if (dateTime2 === undefined || dateTime2 === null) {
      return 1;
    }
    else {
      return this.compareDateTime(dateTime1, dateTime2);
    }
  } 
  
  compareBoolean(a?: boolean, b?: boolean): number{

    if (a === null || a === undefined) {
      a = false;
    }
    if (b === null || b === undefined) {
      b = false;
    }
    if (a === b) {
      return 0;
    }
    else if (a === true) {
      return 1;
    }
    else {
      return -1;
    }
   }
   compareNullableObjField(a: any, b: any, fieldName: string): number {
     if (a === undefined || a === null) {
       return -1;
     }
     else  if (b === undefined || b === null) {
       return 1;
     }
     else {
       let aValue = null;
       let bValue = null;
       Object.keys(a).filter(keyName => keyName === fieldName).forEach(keyName => aValue = a[keyName]);
       Object.keys(b).filter(keyName => keyName === fieldName).forEach(keyName => bValue = b[keyName]);
       if (aValue === null) {
         return -1;
       }
       else if (bValue === null) {
         return 1;
       }
       else {
         // convert to string and compare
         aValue = `${aValue  }`;
         bValue = `${bValue  }`;
         return aValue.localeCompare(bValue);
       }

     }
   }
   
   compareNullableNumber(a?: number, b?: number): number {
     if (a === undefined || a === null) {
       return -1;
     }
     else if (b === undefined || b === null)  {
       return 1;
     }
     else {
       return a - b; 
     }
   }
   
   compareNullableString(a?: string, b?: string): number {
    if (a === undefined || a === null) {
      return -1;
    }
    else if (b === undefined || b === null)  {
      return 1;
    }
    else {
      return a.localeCompare(b);
    }
  }

  cloneClient(client: Client, warehouseSpecific: boolean) : Client {
    return { 
      name: client.name,
      description: client.description,
      contactorFirstname: client.contactorFirstname,
      contactorLastname: client.contactorLastname,
      addressCountry: client.addressCountry,
      addressState: client.addressState,
      addressCounty: client.addressCounty,
      addressCity: client.addressCity,
      addressDistrict: client.addressDistrict,
      addressLine1: client.addressLine1,
      addressLine2: client.addressLine2,
      addressPostcode: client.addressPostcode,
      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id
    }
  }

  cloneCustomer(customer: Customer, warehouseSpecific: boolean) : Customer {
    return {  
      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id,
      name: customer.name,
      description: customer.description,
      contactorFirstname: customer.contactorFirstname,
      contactorLastname: customer.contactorLastname,
      addressCountry: customer.addressCountry,
      addressState: customer.addressState,
      addressCounty: customer.addressCounty,
      addressCity: customer.addressCity,
      addressDistrict: customer.addressDistrict,
      addressLine1: customer.addressLine1,
      addressLine2: customer.addressLine2,
      addressPostcode: customer.addressPostcode
    }
  }
  

  cloneSupplier(supplier: Supplier, warehouseSpecific: boolean) : Supplier {
    return {  
      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id,
      name: supplier.name,
      description: supplier.description,
      contactorFirstname: supplier.contactorFirstname,
      contactorLastname: supplier.contactorLastname,
      addressCountry: supplier.addressCountry,
      addressState: supplier.addressState,
      addressCounty: supplier.addressCounty,
      addressCity: supplier.addressCity,
      addressDistrict: supplier.addressDistrict,
      addressLine1: supplier.addressLine1,
      addressLine2: supplier.addressLine2,
      addressPostcode: supplier.addressPostcode
    }
  }
  cloneUnitOfMeasure(unitOfMeasure: UnitOfMeasure, warehouseSpecific: boolean) : UnitOfMeasure {
    return {  
      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id,
      name: unitOfMeasure.name,
      description: unitOfMeasure.description, 
    }
  }
  cloneItemUnitOfMeasure(itemUnitOfMeasure: ItemUnitOfMeasure, warehouseSpecific: boolean) : ItemUnitOfMeasure {
    return {  
      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id,
      client: itemUnitOfMeasure.client ? this.cloneClient(itemUnitOfMeasure.client!, warehouseSpecific) : undefined,
      supplier: itemUnitOfMeasure.supplier ? this.cloneSupplier(itemUnitOfMeasure.supplier!, warehouseSpecific) : undefined, 
      unitOfMeasure: itemUnitOfMeasure.unitOfMeasure ? this.cloneUnitOfMeasure(itemUnitOfMeasure.unitOfMeasure!, warehouseSpecific) : undefined, 
      quantity: itemUnitOfMeasure.quantity,
      weight: itemUnitOfMeasure.weight,
      length: itemUnitOfMeasure.length,
      width: itemUnitOfMeasure.width,
      height: itemUnitOfMeasure.height, 
      defaultForInboundReceiving: itemUnitOfMeasure.defaultForInboundReceiving,
      defaultForWorkOrderReceiving: itemUnitOfMeasure.defaultForWorkOrderReceiving,
      trackingLpn: itemUnitOfMeasure.trackingLpn
    }
  }
  cloneItemPackageType(itemPackageType: ItemPackageType, warehouseSpecific: boolean) : ItemPackageType {
    return {  
      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id,
      name: itemPackageType.name,
      description: itemPackageType.description, 
      itemUnitOfMeasures: itemPackageType.itemUnitOfMeasures.map(
            itemUnitOfMeasure => this.cloneItemUnitOfMeasure(itemUnitOfMeasure, warehouseSpecific)
          )
    }
  }
  cloneItemFamily(itemFamily: ItemFamily, warehouseSpecific: boolean) : ItemFamily {
    return {  
      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id,
      name: itemFamily.name,
      description: itemFamily.description, 
      totalItemCount: itemFamily.totalItemCount,  
    }

  }
  cloneItem(item: Item, warehouseSpecific: boolean) : Item {

    return { 
      name: item.name,
      description: item.description, 
      client: item.client ? this.cloneClient(item.client!, warehouseSpecific) : undefined,
      itemFamily: item.itemFamily ? this.cloneItemFamily(item.itemFamily!, warehouseSpecific) : undefined,
      itemPackageTypes: item.itemPackageTypes.map(
            itemPackageType => this.cloneItemPackageType(itemPackageType, warehouseSpecific)
        ),
      allowCartonization: item.allowCartonization,
      unitCost: item.unitCost,
      allowAllocationByLPN: item.allowAllocationByLPN,
      allocationRoundUpStrategyType: item.allocationRoundUpStrategyType,
      allocationRoundUpStrategyValue: item.allocationRoundUpStrategyValue,
      trackingVolumeFlag: item.trackingLotNumberFlag,
      trackingLotNumberFlag: item.trackingLotNumberFlag,
      trackingManufactureDateFlag: item.trackingManufactureDateFlag,
      shelfLifeDays: item.shelfLifeDays,
      trackingExpirationDateFlag: item.trackingExpirationDateFlag,

      warehouseId: warehouseSpecific? this.warehouseService.getCurrentWarehouse().id : undefined,
      companyId: this.companyService.getCurrentCompany()!.id,
      imageUrl: item.imageUrl,
      thumbnailUrl: item.thumbnailUrl,
    }
  }

  /**
   * Encode the param for url. 
   * Note: if you use HttpParams to pass the parameters, the framework will encode the value
   * so you don't need to invoke this command
   *
   * @param param 
   * @returns 
   */
  encodeValue(param: string) : string {

    // replace % with * for generic search
    param = param.replace('%', '*');

    
    const httpUrlEncodingCodec = new HttpUrlEncodingCodec();  

    return httpUrlEncodingCodec.encodeValue(param.trim());
  }
  
  /**
   * replace the % with * as now we both support the % and * as wildcard
   *
   * @param param 
   * @returns 
   */
  encodeHttpParameter(param: string) : string {

    // replace % with * for generic search
    return param.replace('%', '*'); 
  }
}
