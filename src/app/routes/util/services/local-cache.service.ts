import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from '../../auth/services/user.service';

import { BillableActivityType } from '../../billing/models/billable-activity-type';
import { BillableActivityTypeService } from '../../billing/services/billable-activity-type.service';
import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { Supplier } from '../../common/models/supplier';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { ClientService } from '../../common/services/client.service';
import { CustomerService } from '../../common/services/customer.service';
import { SupplierService } from '../../common/services/supplier.service';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { Receipt } from '../../inbound/models/receipt';
import { ReceiptService } from '../../inbound/services/receipt.service';
import { InventoryLock } from '../../inventory/models/inventory-lock';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemBarcode } from '../../inventory/models/item-barcode';
import { ItemBarcodeType } from '../../inventory/models/item-barcode-type';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryLockService } from '../../inventory/services/inventory-lock.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemBarcodeTypeService } from '../../inventory/services/item-barcode-type.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { PickWork } from '../../outbound/models/pick-work';
import { PickService } from '../../outbound/services/pick.service';
import { Carrier } from '../../transportation/models/carrier';
import { CarrierServiceLevel } from '../../transportation/models/carrier-service-level';
import { CarrierService } from '../../transportation/services/carrier.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseConfiguration } from '../../warehouse-layout/models/warehouse-configuration';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WebPageTableColumnConfiguration } from '../models/web-page-table-column-configuration';
import { WebPageTableColumnConfigurationService } from './web-page-table-column-configuration.service';

@Injectable({
  providedIn: 'root'
})
export class LocalCacheService {

  cleanInProcess = false;

  
  clientMap = new Map();
  supplierMap = new Map();
  customerMap = new Map();
  locationGroupMap = new Map();
  locationMap = new Map();
  inventoryStatusMap = new Map();
  itemMap = new Map();
  warehouses = new Map();
  itemFamily = new Map();
  inventoryLock = new Map();

  // by default, cache 30 minutes
  defaultCacheTime = 15;
  // at max we will only allow to have 200 items in the local storage
  maxLocalStorageItemCount = 200;

  constructor(
    private http: _HttpClient, 
    private clientService: ClientService,
    private receiptService: ReceiptService,
    private supplierService: SupplierService,
    private customerService: CustomerService,
    private locationGroupService: LocationGroupService,
    private locationService: LocationService,
    private inventoryStatusService: InventoryStatusService,
    private unitOfMeasureService: UnitOfMeasureService,
    private warehouseService: WarehouseService,
    private itemFamilyService: ItemFamilyService,
    private inventoryLockService: InventoryLockService,
    private companyService: CompanyService,
    private userService: UserService,
    private pickService: PickService,
    private itemService: ItemService, 
    private itemBarcodeTypeService: ItemBarcodeTypeService,
    private carrierService: CarrierService,
    private webPageTableColumnConfigurationService: WebPageTableColumnConfigurationService,
    private billableActivityTypeService: BillableActivityTypeService,
    private warehouserConfigurationService: WarehouseConfigurationService) { }

    getWebPageTableColumnConfiguration(
      webPageName: string,
      tableName: string, 
      companyId?: number, username?: string,) : Observable<WebPageTableColumnConfiguration[]> {

        if (companyId == null) {
          companyId = this.companyService.getCurrentCompany()?.id;
        }
        if (username == null) {
          username = this.userService.getCurrentUsername();

        }
      const cacheKey = `web-page-table-column-config-${companyId}-${username}-${webPageName}-${tableName}`;
      const data = this.load(cacheKey)
  
      // Return data from cache
      if (data !== null) {
          return of(data as WebPageTableColumnConfiguration[])
      }
      
      return this.webPageTableColumnConfigurationService.getWebPageTableColumnConfigurations(
        webPageName, tableName)
          .pipe(tap(res => this.save({
            key: cacheKey,
            data: res,
            expirationMins: this.defaultCacheTime
        })));
    } 
    
    getWarehouseConfiguration() : Observable<WarehouseConfiguration> {
      const cacheKey = `warehouse-config-${this.warehouseService.getCurrentWarehouse().id}`;
      const data = this.load(cacheKey)
  
      // Return data from cache
      if (data !== null) {
          return of<WarehouseConfiguration>(data)
      }
      
      return this.warehouserConfigurationService.getWarehouseConfiguration()
          .pipe(tap(res => this.save({
            key: cacheKey,
            data: res,
            expirationMins: this.defaultCacheTime
        })));
  } 
    getItemBarcodeTypes() : Observable<ItemBarcodeType[]> {
      const cacheKey = `item-barcode-types-${this.warehouseService.getCurrentWarehouse().id}`;
      const data = this.load(cacheKey)
  
      // Return data from cache
      if (data !== null) {
          return of(data)
      }
      
      return this.itemBarcodeTypeService.getItemBarcodeTypes()
          .pipe(tap(res => this.save({
            key: cacheKey,
            data: res,
            expirationMins: this.defaultCacheTime
        })));
  } 
  resetWarehouseConfiguration(warehouseConfiguration: WarehouseConfiguration) {
    const cacheKey = `warehouse-config-${this.warehouseService.getCurrentWarehouse}`;
      this.save({
        key: cacheKey,
        data: warehouseConfiguration,
        expirationMins: this.defaultCacheTime
    })
  } 

  getWarehouse(id: number) : Observable<Warehouse> {
      const cacheKey = `warehouse-${id}`;
      const data = this.load(cacheKey)
  
      // Return data from cache
      if (data !== null) {
          return of<Warehouse>(data)
      }
      
      return this.warehouseService.getWarehouse(id)
          .pipe(tap(res => this.save({
            key: cacheKey,
            data: res,
            expirationMins: this.defaultCacheTime
        })));
  }  
  
  getReceipt(id: number) : Observable<Receipt> {
    const cacheKey = `receipt-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<Receipt>(data)
    }
    
    return this.receiptService.getReceipt(id, true)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
  }  

  getClient(id: number) : Observable<Client> {
    const cacheKey = `client-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<Client>(data)
    }
    
    return this.clientService.getClient(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
  }  
  getSupplier(id: number) : Observable<Supplier> {
    
    
    const cacheKey = `supplier-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<Supplier>(data)
    }
    
    return this.supplierService.getSupplier(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
 
  }  
  getCarrier(id: number) : Observable<Carrier> {
    
    
    const cacheKey = `carrier-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<Carrier>(data)
    }
    
    return this.carrierService.getCarrier(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
 
  }  
   
  getBillableActivityType(id: number) : Observable<BillableActivityType> {
    
    
    const cacheKey = `billableActivityType-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<BillableActivityType>(data)
    }
    
    return this.billableActivityTypeService.getBillableActivityType(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
 
  }  
  
  getCustomer(id: number) : Observable<Customer> {
    
    const cacheKey = `customer-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<Customer>(data)
    }
    
    return this.customerService.getCustomer(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
 
  }  
  
  getLocationGroup(id: number) : Observable<LocationGroup> {
    
    const cacheKey = `location-group-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<LocationGroup>(data)
    }
    
    return this.locationGroupService.getLocationGroup(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
      
  }  
  
  getLocation(id: number) : Observable<WarehouseLocation> {
    
    
    const cacheKey = `location-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<WarehouseLocation>(data)
    }
    
    return this.locationService.getLocation(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));

      
  }  
  
  getInventoryStatus(id: number) : Observable<InventoryStatus> {
    
    
    const cacheKey = `inventory-status-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<InventoryStatus>(data)
    }
    
    return this.inventoryStatusService.getInventoryStatus(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
      
  }  
  
  getItem(id: number) : Observable<Item> {
    
    const cacheKey = `item-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<Item>(data)
    }
    
    return this.itemService.getItem(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
      
      
  }  
  
  getItemFamily(id: number) : Observable<ItemFamily> {
    
    const cacheKey = `item-family-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<ItemFamily>(data)
    }
    
    return this.itemFamilyService.getItemFamily(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));      
  }  
  
  getInventoryLock(id: number) : Observable<InventoryLock> {
    
    const cacheKey = `inventory-lock-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<InventoryLock>(data)
    }
    
    return this.inventoryLockService.getInventoryLock(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));      
  }  
  getPick(id: number) : Observable<PickWork> {
    
    const cacheKey = `pickwork-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<PickWork>(data)
    }
    
    return this.pickService.getPick(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
      
      
  } 
  
  getUnitOfMeasure(id: number) : Observable<UnitOfMeasure> {
    
    const cacheKey = `unitOfMeasure-${id}`;
    const data = this.load(cacheKey)

    // Return data from cache
    if (data !== null) {
        return of<UnitOfMeasure>(data)
    }
    
    return this.unitOfMeasureService.getUnitOfMeasure(id)
        .pipe(tap(res => this.save({
          key: cacheKey,
          data: res,
          expirationMins: this.defaultCacheTime
      })));
      
      
  }    
  save(options: LocalStorageSaveOptions) {
    
      // clear the cache key
      this.removeExpiredCache();
      // console.log(`localStorage.length: ${localStorage.length}`);

      // Set default values for optionals
      options.expirationMins = options.expirationMins || 0

      // Set expiration date in miliseconds
      const expirationMS = options.expirationMins !== 0 ? options.expirationMins * 60 * 1000 : 0

      const record = {
          value: typeof options.data === 'string' ? options.data : JSON.stringify(options.data),
          expiration: expirationMS !== 0 ? new Date().getTime() + expirationMS : null,
          hasExpiration: expirationMS !== 0 ? true : false
      }
      // console.log(`localStorage.length： ${localStorage.length}`);
      localStorage.setItem(options.key, JSON.stringify(record))
  }

  load(key: string) {
      // Get cached data from localstorage
      const item = localStorage.getItem(key)
      if (item !== null) {
          const record = JSON.parse(item)
          const now = new Date().getTime()
          // Expired data will return null
          if (!record || (record.hasExpiration && record.expiration <= now)) {
              return null
          } else {
              return JSON.parse(record.value)
          }
      }
      return null
  }
  
  removeExpiredCache() {
    if (this.cleanInProcess == true) {
      return;
    }
    this.cleanInProcess = true;

    
    setTimeout(() => {
      
        var keys = Object.keys(localStorage).filter(
          key => key.startsWith("client-") ||
                  key.startsWith("supplier-") ||
                  key.startsWith("receipt-") ||
                  key.startsWith("customer-") ||
                  key.startsWith("location-group-") ||
                  key.startsWith("location-") ||
                  key.startsWith("inventory-status-") ||
                  key.startsWith("item-") ||
                  key.startsWith("pickwork-") ||
                  key.startsWith("unitOfMeasure-")
        );

        
        var i = keys.length;
        var remainingLocalStorageRecords:
        {
          key: string,
          value: string,
          expiration: number,
          hasExpiration: boolean
        }[]  = [];

        const now = new Date().getTime();

        while (i--) {
          const record = JSON.parse(localStorage.getItem(keys[i])!);
          if (record.hasExpiration && record.expiration <= now) {
            // console.log(`${keys[i]} expired, will clear it`) ;
            localStorage.removeItem(keys[i]);
          }
          else {
            remainingLocalStorageRecords = [...remainingLocalStorageRecords, 
              {
                key: keys[i],
                value: record.value,
                expiration: record.expiration,
                hasExpiration: record.hasExpiration ,
              }];
          }
        }
        if (remainingLocalStorageRecords.length > this.maxLocalStorageItemCount) {
           // too many items left in the local storage item, let's remove some
           remainingLocalStorageRecords.sort((a,b) => a.expiration - b.expiration);
           var recordToBeRemovedCount = remainingLocalStorageRecords.length - this.maxLocalStorageItemCount;
           for(var index = 0; index < recordToBeRemovedCount; index++) {
                localStorage.removeItem(remainingLocalStorageRecords[index].key);
           }
           remainingLocalStorageRecords = remainingLocalStorageRecords.slice(index + 1);
        }
        let size = this.getTotalLocalCacheSizeInKB();
        // console.log(`current cache size ${size}`);
        // max localstorage size is 5 MB
        while (size > 4.5 * 1024) {
          for(var index = 0; index < 5; index++) {
              localStorage.removeItem(remainingLocalStorageRecords[index].key);
          }
          remainingLocalStorageRecords = remainingLocalStorageRecords.slice(index + 1);
          size = this.getTotalLocalCacheSizeInKB();
          // console.log(`current cache size ${size}`);
        }
        this.cleanInProcess = false;
    }, 500);

  }

  getTotalLocalCacheSizeInKB() : number {
    var values = "";
    for(var key in localStorage) {
      values += localStorage[key]
    }
    // return size in KB
    return values ?  ((values.length*16)/(8*1024)) : 0;
  }

  
}
export class LocalStorageSaveOptions {
  key!: string
  data: any
  expirationMins?: number
}
