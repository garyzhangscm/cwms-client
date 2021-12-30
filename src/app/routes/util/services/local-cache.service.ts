import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { Supplier } from '../../common/models/supplier';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { ClientService } from '../../common/services/client.service';
import { CustomerService } from '../../common/services/customer.service';
import { SupplierService } from '../../common/services/supplier.service';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { InventoryLock } from '../../inventory/models/inventory-lock';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryLockService } from '../../inventory/services/inventory-lock.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { PickWork } from '../../outbound/models/pick-work';
import { PickService } from '../../outbound/services/pick.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';

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
  defaultCacheTime = 30;

  constructor(
    private http: _HttpClient, 
    private clientService: ClientService,
    private supplierService: SupplierService,
    private customerService: CustomerService,
    private locationGroupService: LocationGroupService,
    private locationService: LocationService,
    private inventoryStatusService: InventoryStatusService,
    private unitOfMeasureService: UnitOfMeasureService,
    private warehouseService: WarehouseService,
    private itemFamilyService: ItemFamilyService,
    private inventoryLockService: InventoryLockService,
    private pickService: PickService,
    private itemService: ItemService) { }

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
                  key.startsWith("customer-") ||
                  key.startsWith("location-group-") ||
                  key.startsWith("location-") ||
                  key.startsWith("inventory-status-") ||
                  key.startsWith("item-") ||
                  key.startsWith("pickwork-") ||
                  key.startsWith("unitOfMeasure-")
        );

        
        var i = keys.length;

        const now = new Date().getTime();

        while (i--) {
          const record = JSON.parse(localStorage.getItem(keys[i])!);
          if (record.hasExpiration && record.expiration <= now) {
            // console.log(`${keys[i]} expired, will clear it`) ;
            localStorage.removeItem(keys[i]);
          }
        }
        this.cleanInProcess = false;
    }, 500);

  }
  
}
export class LocalStorageSaveOptions {
  key!: string
  data: any
  expirationMins?: number
}
