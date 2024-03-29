import { formatDate } from '@angular/common'; 
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
// import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
// import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { ClientService } from '../../common/services/client.service';
import { PrintingService } from '../../common/services/printing.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum'; 
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { Inventory } from '../models/inventory';
import { InventoryDisplayOption } from '../models/inventory-display-option.enum';
import { InventoryMovement } from '../models/inventory-movement';
import { InventoryStatus } from '../models/inventory-status';
import { ItemFamily } from '../models/item-family';
import { ItemUnitOfMeasure } from '../models/item-unit-of-measure';
import { InventoryStatusService } from '../services/inventory-status.service';
import { InventoryService } from '../services/inventory.service';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
  selector: 'app-inventory-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.less'],
})
export class InventoryInventoryComponent implements OnInit {
 
  @ViewChild('inventoryTable', { static: false })
  inventoryTable!: STComponent;
  invetoryTablePagination = {
    showSize: true,
    pageSizes: [5, 10, 25, 50, 100]
  };

  inventoryTableRecordPerPages: number[] = [5, 10, 25, 50, 100]
  inventoryTablecolumns: STColumn[] = [
    { title: '', index: 'number', type: 'checkbox' },
    { title: this.i18n.fanyi("client"),  index: 'client.name' ,
        iif: () => this.isChoose('client')  && this.threePartyLogisticsFlag }, 
    { title: this.i18n.fanyi("lpn"),  index: 'lpn' ,
        iif: () => this.isChoose('lpn')  }, 
    { title: this.i18n.fanyi("item"),  render: 'itemColumn',
        iif: () => this.isChoose('item')  }, 
    { title: this.i18n.fanyi("item.package-type"),  render: 'itemPackageTypeColumn',
        iif: () => this.isChoose('itemPackageType')  }, 
    { title: this.i18n.fanyi("location"),  render: 'locationColumn' ,
        iif: () => this.isChoose('location')  }, 
    { title: this.i18n.fanyi("quantity"),  render: 'quantityColumn' , index: 'quantity',
        iif: () => this.isChoose('quantity') , statistical: 'sum', key: 'quantitySum'}, 
    { title: this.i18n.fanyi("inventory.status"),  render: 'inventoryStatusColumn' ,
        iif: () => this.isChoose('inventoryStatus')  }, 
    { title: this.i18n.fanyi("fifoDate"),  render: 'fifoDateColumn' ,
        iif: () => this.isChoose('fifoDate')  }, 
    { title: this.i18n.fanyi("color"),  index: 'color' ,
        iif: () => this.isChoose('color')  }, 
    { title: this.i18n.fanyi("productSize"),  index: 'productSize' ,
        iif: () => this.isChoose('productSize')  }, 
    { title: this.i18n.fanyi("style"),  index: 'style' ,
        iif: () => this.isChoose('style')  }, 
    { title: this.i18n.fanyi("inventory.locked-for-adjustment"),  render: 'lockedForAdjustColumn' ,
        iif: () => this.isChoose('lockedForAdjust')  }, 
    { title: this.i18n.fanyi("inventory.pick-id"),  render: 'pickColumn' ,
        iif: () => this.isChoose('pick')  },   
    { title: this.i18n.fanyi("inventory.allocated-by-pick-id"),  render: 'allocateByPickColumn' ,
        iif: () => this.isChoose('allocateByPick')  },   
    { title: this.i18n.fanyi("movement-path"),  render: 'movementPathColumn' ,
        iif: () => this.isChoose('movementPath')  },   
    { title: this.i18n.fanyi("action"),  render: 'actionColumn' , 
      iif: () => (!this.displayOnly) && (this.inventoryDisplayOption == null || this.inventoryDisplayOption == InventoryDisplayOption.NONE),
      width: 350,
      fixed: 'right',},  
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("client"), value: 'client', checked: true },
    { label: this.i18n.fanyi("lpn"), value: 'lpn', checked: true },
    { label: this.i18n.fanyi("item"), value: 'item', checked: true },
    { label: this.i18n.fanyi("item.package-type"), value: 'itemPackageType', checked: true },
    { label: this.i18n.fanyi("location"), value: 'location', checked: true },
    { label: this.i18n.fanyi("quantity"), value: 'quantity', checked: true },
    { label: this.i18n.fanyi("inventory.status"), value: 'inventoryStatus', checked: true },
    { label: this.i18n.fanyi("fifoDate"), value: 'fifoDate', checked: true }, 
    { label: this.i18n.fanyi("color"), value: 'color', checked: true }, 
    { label: this.i18n.fanyi("productSize"), value: 'productSize', checked: true }, 
    { label: this.i18n.fanyi("style"), value: 'style', checked: true }, 
    { label: this.i18n.fanyi("inventory.locked-for-adjustment"), value: 'lockedForAdjust', checked: true }, 
    { label: this.i18n.fanyi("inventory.pick-id"), value: 'pick', checked: true }, 
    { label: this.i18n.fanyi("inventory.allocated-by-pick-id"), value: 'allocateByPick', checked: true }, 
    { label: this.i18n.fanyi("movement-path"), value: 'movementPath', checked: true }, 
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.inventoryTable !== undefined && this.inventoryTable.columns !== undefined) {
        this.inventoryTable!.resetColumns({ emitReload: true });

    }
  }

  // Select control for clients and item families 
  availableClients: Client[] = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: UntypedFormGroup;
  inventoryMovementForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  inventories: Inventory[] = [];
  listOfDisplayInventories: Inventory[] = [];
  locationGroups: LocationGroup[] = [];


  inventoryToBeRemoved!: Inventory;
  inventoryRemovalModal!: NzModalRef;

  documentNumber = '';
  comment = '';

  isCollapse = false;
  isSpinning = false;
  validInventoryStatuses: InventoryStatus[] = [];

  inventoryMoveModal!: NzModalRef;

  mapOfInprocessInventoryId: { [key: string]: boolean } = {};

  // whether we are move inventory in a batch
  batchMovement = false;
  inventoryDisplayOptions = InventoryDisplayOption;
  inventoryDisplayOption?: InventoryDisplayOption;
  
  loadingDetailsRequest = 0;
  threePartyLogisticsFlag = false;


/** 
 * 
 * 
  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
*/

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['adjust-inventory-quantity', false],
    ['change-inventory-attribute', false],
    ['move-inventory', false],
    ['remove-inventory', false],
    ['remove-inventory-in-batch', false],
    ['move-inventory-in-batch', false],
    ['upload-inventory', false],
    ['reverse-inventory', false],
  ]);
  
  constructor(
    private fb: UntypedFormBuilder,
    private inventoryService: InventoryService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private locationService: LocationService,
    private locationGroupService: LocationGroupService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private printingService: PrintingService,
    private router: Router,
    private localCacheService: LocalCacheService,
    private userService: UserService,
    private inventoryStatusService: InventoryStatusService,
    private workOrderService: WorkOrderService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/inventory").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );      
    userService.getUserPermissionByWebPage("/inventory/inventory").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    }); 
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory'));
    this.initSearchForm();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('refresh')) {
        if (params.id) {
          this.search(params.id);
        } else if (params.lpn) {
          this.searchForm.controls.lpn.setValue(params.lpn);
          this.search();
        } else if (params.location) {
          this.searchForm.controls.location.setValue(params.location);
          this.search();
        } else {
          this.search();
        }
      }
    });
    
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });
    
    this.inventoryStatusService
    .loadInventoryStatuses()
    .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses)); 

    this.initClientAssignment();
  }
   

  initClientAssignment(): void {
    
    this.isSpinning = true;
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
    
  }
   

  resetForm(): void {
    this.searchForm.reset();
    this.inventories = [];
    this.listOfDisplayInventories = [];


  }
  search(id?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
    
    // this.setOfCheckedId.clear();
    if (id) {
      this.inventoryService.getInventoryById(id).subscribe(
        inventoryRes => { 
          this.processInventoryQueryResult([inventoryRes]);
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: 1,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
    } else {
      
      this.inventoryService
        .getInventories(
          this.searchForm.value.client,
          this.searchForm.value.taggedItemFamilies,
          this.searchForm.value.itemName,
          this.searchForm.value.location,
          this.searchForm.value.lpn,
          false,
          this.searchForm.value.inventoryStatus,
          this.searchForm.value.locationGroups
        )
        .subscribe(
          inventoryRes => {
            this.processInventoryQueryResult(inventoryRes);
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: inventoryRes.length,
            });
          },
          () => {
            this.isSpinning = false;
            this.searchResult = '';
          },
        );
    }
  }

  processInventoryQueryResult(inventories: Inventory[]): void {
    this.inventories = inventories;
    this.setupDisplay(inventories);

    this.loadDetails(this.listOfDisplayInventories);

  }
  setupDisplay(inventories: Inventory[]): void {
    if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_LPN) {

      this.setupDisplayGroupByLpn(inventories);
    }
    else if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_ITEM) {

      this.setupDisplayGroupByItem(inventories);
    }
    else if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_LOCATION) {

      this.setupDisplayGroupByLocation(inventories);
    }
    else if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_LOCATION_ITEM) {

      this.setupDisplayGroupByLocationAndItem(inventories);
    }
    else {
      // by default display the result directly
      this.listOfDisplayInventories = inventories
    }
 
  }
  
  setupDisplayGroupByLpn(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: lpn
    // value: Inventory result
    let inventoryMap : Map<String, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: String = inventory.lpn!;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }
  
  setupDisplayGroupByItem(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: item id
    // value: Inventory result
    let inventoryMap : Map<number, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: number = inventory.item!.id!;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }
  setupDisplayGroupByLocation(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: location id
    // value: Inventory result
    let inventoryMap : Map<number, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: number = inventory.locationId!;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }
  setupDisplayGroupByLocationAndItem(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: location id - Item id
    // value: Inventory result
    let inventoryMap : Map<String, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: String = `${inventory.locationId!}-${inventory.item?.id}`;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }

  // the value already exists, let's setup the value
  // 1. sum up the quantity
  // 2. for other attribute, if the new inventory has
  //    different value from the previous inventory, then
  //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
  sumUpInventory(existingInventory: Inventory, newInventory: Inventory) : Inventory {
    let sumInventory : Inventory = { 
      lpn: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
      client: existingInventory.clientId == newInventory.clientId ? existingInventory.client : undefined,
      clientId: existingInventory.clientId == newInventory.clientId ? existingInventory.clientId : undefined,
      locationId: existingInventory.locationId == newInventory.locationId ? existingInventory.locationId : undefined,
      location: existingInventory.locationId == newInventory.locationId ? existingInventory.location : undefined,
      locationName: existingInventory.locationId == newInventory.locationId ? existingInventory.locationName : "** Multiple Values**",
      item: existingInventory.item?.id == newInventory.item?.id ? existingInventory.item : undefined,
      virtual: existingInventory.virtual == newInventory.virtual ? existingInventory.virtual : undefined,
      warehouseId: existingInventory.warehouseId == newInventory.warehouseId ? existingInventory.warehouseId : undefined,
      warehouse: existingInventory.warehouseId == newInventory.warehouseId ? existingInventory.warehouse : undefined,
      itemPackageType: existingInventory.itemPackageType?.id == newInventory.itemPackageType?.id ? existingInventory.itemPackageType : undefined,
      quantity: existingInventory.quantity! + newInventory.quantity!,
      displayQuantity: (existingInventory.displayQuantity ? 0 : existingInventory.displayQuantity!) 
              +  (newInventory.displayQuantity ? 0 : newInventory.displayQuantity!),
      inventoryStatus: existingInventory.inventoryStatus?.id == newInventory.inventoryStatus?.id ? existingInventory.inventoryStatus : undefined, 
      lockedForAdjust: existingInventory.lockedForAdjust == newInventory.lockedForAdjust ? existingInventory.lockedForAdjust : undefined,
    
      pickId: existingInventory.pickId == newInventory.pickId ? existingInventory.pickId : undefined,
      pick: existingInventory.pickId == newInventory.pickId ? existingInventory.pick : undefined,
      allocatedByPickId: existingInventory.allocatedByPickId == newInventory.allocatedByPickId ? existingInventory.allocatedByPickId : undefined,
      allocatedByPick: existingInventory.allocatedByPickId == newInventory.allocatedByPickId ? existingInventory.allocatedByPick : undefined,
    
      inventoryMovements: [],
      receiptId: existingInventory.receiptId == newInventory.receiptId ? existingInventory.receiptId : undefined,
      receiptLineId: existingInventory.receiptLineId == newInventory.receiptLineId ? existingInventory.receiptLineId : undefined,
      inboundQCRequired: existingInventory.inboundQCRequired == newInventory.inboundQCRequired ? existingInventory.inboundQCRequired : undefined,
    
      fifoDate: existingInventory.fifoDate == newInventory.fifoDate ? existingInventory.fifoDate : undefined,
      
      color: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
      productSize: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
      style: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
    }

    // console.log(`existingInventory ${existingInventory.lpn}'s quantity: ${existingInventory.quantity}`);
    // console.log(`newInventory ${newInventory.lpn}'s quantity: ${newInventory.quantity}`);
    // console.log(`sumInventory ${sumInventory.lpn}'s quantity: ${sumInventory.quantity}`);

    return sumInventory;
  }
  
  // we will load the information 
  // asyncronized
  async loadDetails(inventories: Inventory[]) {
 
    let index = 0;
    this.loadingDetailsRequest = 0;

    
    while (index < inventories.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 inventory at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many inventory into the server at a time 
      
      
      while(this.loadingDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      await this.loadDetail(inventories[index]);
      index++;
    } 
    while(this.loadingDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
 
    this.inventoryTable.reload();  
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  async loadDetail(inventory: Inventory) {
 

    await this.loadLocation(inventory);

    this.loadClients(inventory);

    this.loadInventoryMovements(inventory);

    // load the Unit of Measure for each item unit of measure of each package type
    this.loadUnitOfMeasure(inventory);

    // calculate the display quantity based on the display UOM
    this.calculateDisplayQuantity(inventory);

    await this.loadPicksInformation(inventory);
    
    await this.loadAllocateByPicksInformation(inventory);

    await this.loadStockUnitOfMeasure(inventory);

    await this.loadDisplayUnitOfMeasure(inventory);

    
  }

  calculateDisplayQuantity(inventory: Inventory) : void {
    // see if we have the display UOM setup
    // console.log(`start to setup display quantity for inventory of lpn ${inventory.lpn}`)
    if (inventory.itemPackageType?.displayItemUnitOfMeasure) {
      // console.log(`inventory.itemPackageType \n ${JSON.stringify(inventory.itemPackageType)}`);
      let displayItemUnitOfMeasureQuantity  = inventory.itemPackageType.displayItemUnitOfMeasure.quantity;

      if (inventory.quantity! % displayItemUnitOfMeasureQuantity! ==0) {
        inventory.displayQuantity = inventory.quantity! / displayItemUnitOfMeasureQuantity!
      }
      else {
        // the inventory's quantity can't be devided by the display uom, we will display the quantity in 
        // stock uom
        inventory.displayQuantity = inventory.quantity;
        inventory.itemPackageType.displayItemUnitOfMeasure = inventory.itemPackageType.stockItemUnitOfMeasure;
      }
    }
    else {
      // there's no display UOM setup for this inventory, we will display
      // by the quantity
      inventory.displayQuantity = inventory.quantity; 
    }
  }
  
  async loadLocation(inventory: Inventory) {
 
    /***
     * 
    if (inventory.locationId && inventory.location == null) {
      this.loadingDetailsRequest++;
      this.localCacheService.getLocation(inventory.locationId!).subscribe(
        {
          next: (locationRes) => {
            inventory.location = locationRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     */
    // load the information for current location
    if (inventory.locationId && inventory.location == null) {
      this.loadingDetailsRequest++;
      inventory.location =  await this.localCacheService.getLocation(inventory.locationId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
       
    } 

  }
   
  async loadClients(inventory: Inventory) {
    if (inventory.clientId && inventory.client == null) {
      this.loadingDetailsRequest++;
      inventory.client =  await this.localCacheService.getClient(inventory.clientId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 

  }

  async loadInventoryMovements(inventory: Inventory) {
 
    // load the location of the inventory movement
    if (inventory.inventoryMovements && inventory.inventoryMovements.length > 0) {
      inventory.inventoryMovements.forEach(
        inventoryMovement => this.loadInventoryMovementDetails(inventoryMovement)
      )
    }

  }
  async loadInventoryMovementDetails(inventoryMovement: InventoryMovement) {

    /**
     * 
    if (inventoryMovement.locationId && inventoryMovement.location == null) {

      this.loadingDetailsRequest++;
      this.localCacheService.getLocation(inventoryMovement.locationId!).subscribe(
        {
          next: (locationRes) => {
            inventoryMovement.location = locationRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     * 
     */
    if (inventoryMovement.locationId && inventoryMovement.location == null) {

      this.loadingDetailsRequest++;
      /**
       * 
      inventoryMovement.location =  await this.localCacheService.getLocation(inventoryMovement.locationId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
       * 
       */
      inventoryMovement.location =  await lastValueFrom(this.localCacheService.getLocation(inventoryMovement.locationId!)).finally(
        () => this.loadingDetailsRequest--
      );
    } 
  }
  async loadPicksInformation(inventory: Inventory) {

    /**
     * 
    // load the pick informaiton
    if (inventory.pickId && inventory.pick == null) {
      this.loadingDetailsRequest++;
      this.localCacheService.getPick(inventory.pickId!).subscribe(
        {
          next: (pickRes) => {
            inventory.pick = pickRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     */
    // load the pick informaiton
    if (inventory.pickId && inventory.pick == null) {
      this.loadingDetailsRequest++;
      inventory.pick =  await this.localCacheService.getPick(inventory.pickId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 
  }
  async loadAllocateByPicksInformation(inventory: Inventory) {

    /**
    // load the allocate by pick informaiton
    if (inventory.allocatedByPickId && inventory.allocatedByPick == null) {
      this.loadingDetailsRequest++;
      this.localCacheService.getPick(inventory.allocatedByPickId!).subscribe(
        {
          next: (pickRes) => {
            inventory.allocatedByPick = pickRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     * 
     */
    // load the allocate by pick informaiton
    if (inventory.allocatedByPickId && inventory.allocatedByPick == null) {
      this.loadingDetailsRequest++;
      inventory.allocatedByPick =  await this.localCacheService.getPick(inventory.allocatedByPickId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 
  }
  async loadUnitOfMeasure(inventory: Inventory) {
    if (inventory.itemPackageType && inventory.itemPackageType.itemUnitOfMeasures &&
              inventory.itemPackageType.itemUnitOfMeasures.length > 0) {

      inventory.itemPackageType.itemUnitOfMeasures.filter(
        itemUnitOfMeasure  => itemUnitOfMeasure.unitOfMeasureId != null && 
                                  itemUnitOfMeasure.unitOfMeasure == null
      ).forEach(
          itemUnitOfMeasure => {
            
            this.loadingDetailsRequest++;
            this.localCacheService.getUnitOfMeasure(itemUnitOfMeasure.unitOfMeasureId!)
              .subscribe({
                next: (unitOfMeasureRes) => {
                  itemUnitOfMeasure.unitOfMeasure = unitOfMeasureRes;
                  this.loadingDetailsRequest--;
                
                }, 
                error: () => this.loadingDetailsRequest--
              })
          }
      )
    }
  } 
  
  async loadStockUnitOfMeasure(inventory: Inventory) {
    if (inventory.itemPackageType?.stockItemUnitOfMeasure?.unitOfMeasureId != null &&
      inventory.itemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure == null) {
 
        this.loadingDetailsRequest++;
        this.localCacheService.getUnitOfMeasure(inventory.itemPackageType.stockItemUnitOfMeasure.unitOfMeasureId!)
              .subscribe({
                next: (unitOfMeasureRes) => {
                  inventory.itemPackageType!.stockItemUnitOfMeasure!.unitOfMeasure = unitOfMeasureRes;
                  this.loadingDetailsRequest--;
                
                }, 
                error: () => this.loadingDetailsRequest--
              }) 
    }
  } 
  

  async loadDisplayUnitOfMeasure(inventory: Inventory) {
    if (inventory.itemPackageType?.displayItemUnitOfMeasure?.unitOfMeasureId != null &&
      inventory.itemPackageType?.displayItemUnitOfMeasure?.unitOfMeasure == null) {
 
        this.loadingDetailsRequest++;
        this.localCacheService.getUnitOfMeasure(inventory.itemPackageType.displayItemUnitOfMeasure.unitOfMeasureId!)
              .subscribe({
                next: (unitOfMeasureRes) => {
                  inventory.itemPackageType!.displayItemUnitOfMeasure!.unitOfMeasure = unitOfMeasureRes;
                  this.loadingDetailsRequest--;
                
                }, 
                error: () => this.loadingDetailsRequest--
              }) 
    }
  }  
 
  adjustInventory(inventory: Inventory): void {
    console.log(`will adjust inventory: ${  JSON.stringify(inventory)}`);
  }
  openRemoveInventoryModal(
    inventory: Inventory,
    tplInventoryRemovalModalTitle: TemplateRef<{}>,
    tplInventoryRemovalModalContent: TemplateRef<{}>,
  ): void {
    this.mapOfInprocessInventoryId[inventory.id!] = true;
    this.inventoryToBeRemoved = inventory;
    this.documentNumber = '';
    this.comment = '';

    this.inventoryRemovalModal = this.modalService.create({
      nzTitle: tplInventoryRemovalModalTitle,
      nzContent: tplInventoryRemovalModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryRemovalModal.destroy();
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        this.search();
      },
      nzOnOk: () => {
        this.removeInventory(this.inventoryToBeRemoved);
      },
      nzWidth: 1000,
    });
  }

  removeInventory(inventory: Inventory): void {
    this.isSpinning = true;
    this.inventoryService.adjustDownInventory(inventory, this.documentNumber, this.comment).subscribe(
      inventoryRes => {
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        this.isSpinning = false;
        if (inventoryRes.lockedForAdjust === true) {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.request-success'));
        } else {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
        }
        this.search();
      },
      () => {
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        this.isSpinning = false;
        this.messageService.error(this.i18n.fanyi('message.action.fail'));
      },
    );

    this.inventoryRemovalModal.destroy();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      client: [null],
      locationGroups: [null],
      taggedItemFamilies: [null],
      itemName: [null],
      location: [null],
      lpn: [null],
      inventoryStatus: [null],
    });

    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });

    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }

  openMoveInventoryModal(
    inventory: Inventory,
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>, 
  ): void {
    this.mapOfInprocessInventoryId[inventory.id!] = true;
    this.inventoryMovementForm = this.fb.group({
      lpn: new UntypedFormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new UntypedFormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new UntypedFormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new UntypedFormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new UntypedFormControl({ value: inventory.quantity, disabled: true }),
      locationName: new UntypedFormControl({ value: inventory.location!.name, disabled: true }),
      destinationLocation: [null],
      immediateMove: [false],
    });

    this.batchMovement = false;
    // Load the location
    this.inventoryMoveModal = this.modalService.create({
      nzTitle: tplInventoryMoveModalTitle,
      nzContent: tplInventoryMoveModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryMoveModal.destroy();
        this.mapOfInprocessInventoryId[inventory.id!] = false;
      },
      nzOnOk: () => {
        this.moveInventory(
          inventory,
          this.inventoryMovementForm.controls.destinationLocation.value,
          this.inventoryMovementForm.controls.immediateMove.value,
        );
      },

      nzWidth: 1000,
    });
  }
  
  openBatchMoveInventoryModal( 
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>, 
  ): void { 
    this.inventoryMovementForm = this.fb.group({
       
      destinationLocation: [null],
      immediateMove: [false],
    });

    this.batchMovement = true;
    // Load the location
    this.inventoryMoveModal = this.modalService.create({
      nzTitle: tplInventoryMoveModalTitle,
      nzContent: tplInventoryMoveModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryMoveModal.destroy(); 
      },
      nzOnOk: () => {
        
        this.inventoryMoveModal.updateConfig({ 
          nzOkDisabled: true,
          nzOkLoading: true
        });
        this.moveInventoryInBatch(
          this.getSelectedInventory(),
          this.inventoryMovementForm.controls.destinationLocation.value,
          this.inventoryMovementForm.controls.immediateMove.value,
        );
        return false;
      },

      nzWidth: 1000,
    });
  }
   

  moveInventoryInBatch(inventories: Inventory[], destinationLocationName: string, immediateMove: boolean): void {
    this.isSpinning = true;
    this.locationService.getLocations(undefined, undefined, destinationLocationName).subscribe({
      next: (locationsRes) => { 
        if (locationsRes.length == 0 ||
          locationsRes[0].locationGroup?.locationGroupType?.fourWallInventory == false) {
          this.messageService.error(`can't find location with name ${destinationLocationName}`);
          this.isSpinning = false;
          
          this.inventoryMoveModal.updateConfig({ 
            nzOkDisabled: false,
            nzOkLoading: false
          });
        } 
        else {

          this.moveInventoryInBatchSteps(inventories, locationsRes[0], immediateMove, inventories.length - 1);
        }

        
      }, 
      error: () => this.isSpinning = false
    });  
  }
  moveInventoryInBatchSteps(inventories: Inventory[], location: WarehouseLocation, immediateMove: boolean, index: number): void {

    // stop if we already process all the items in the list
    if (index < 0) {
      this.isSpinning = false;
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.inventoryMoveModal.destroy(); 
      this.search();
      return;
    }
    // process the inventory at the index and recursively call to process the next
    this.inventoryService.move(inventories[index], location, immediateMove).subscribe({
      next: () => { 
        this.moveInventoryInBatchSteps(inventories, location, immediateMove, index - 1);
  
      }, 
      error: () => this.isSpinning = false
    });
  }
  moveInventory(inventory: Inventory, destinationLocationName: string, immediateMove: boolean): void {
    this.locationService.getLocations(undefined, undefined, destinationLocationName).subscribe(location => {
      this.inventoryService.move(inventory, location[0], immediateMove).subscribe(
        inventoryRes => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));

          this.mapOfInprocessInventoryId[inventory.id!] = false;
          // refresh with LPN
          this.searchForm.controls.lpn.setValue(inventory.lpn);
          this.search();
        },
        () => {
          this.messageService.error(this.i18n.fanyi('message.action.fail'));

          this.mapOfInprocessInventoryId[inventory.id!] = false;
        },
      );
    });
  }

  processItemQueryResult(selectedItemName: any): void {
    // console.log(`start to query with item name ${selectedItemName}`);
    this.searchForm.controls.itemName.setValue(selectedItemName);
  }
  processLocationQueryResult(selectedLocationName: any): void {
    // console.log(`start to query with location name ${selectedLocationName}`);
    this.inventoryMovementForm.controls.destinationLocation.setValue(selectedLocationName);
  }


  processQueryLocationQueryResult(selectedLocationName: any): void {
    // console.log(`start to query with location name ${selectedLocationName}`);
    this.searchForm.controls.location.setValue(selectedLocationName);
  }

  printLPNReport(event: any, inventory: Inventory) {

    this.isSpinning = true;
    
    // console.log(`start to print lPN label for inventory \n${inventory}`);
    this.inventoryService.generateLPNLabel(
      inventory.lpn!, undefined, event.printerName)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        // console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "LPN Label",
          printResult.fileName,
          // ReportType.LPN_LABEL,
          printResult.type,   // The report type may be LPN_LABEL , RECEIVING_LPN_LABEL or PRODUCTION_LINE_ASSIGNMENT_LABEL
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          inventory.location?.locationGroup?.name, 
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewLPNReport(inventory: Inventory): void {


    this.isSpinning = true;
    this.inventoryService.generateLPNLabel(inventory.lpn!)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }
  processLocationValueQueryResult(event: Event) {
    console.log(`inventory selected: ${(event.target as HTMLInputElement).value}`)
  }

  
  removeSelectedInventory(): void {
    // make sure we have at least one checkbox checked
    
    this.isSpinning = true;
    const selectedInventory = this.getSelectedInventory();
    if (selectedInventory.length > 0) {
      const inventoryIds = selectedInventory.map(inventory => inventory.id!).join(",");
        this.inventoryService.removeInventories(inventoryIds).subscribe(
          {
            next: () => {
              this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
              this.isSpinning = false;
              this.search();
            }, 
            error: () => {
                    
              this.isSpinning = false;
              this.messageService.error(this.i18n.fanyi('message.action.fail'));
            }
          }

        )
    }
    else {
      
      this.isSpinning = false;
    }
    
  }
  
  getSelectedInventory(): Inventory[] {
    let selectedInventory: Inventory[] = [];
    
    const dataList: STData[] = this.inventoryTable.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedInventory = [...selectedInventory,
              ...this.inventories.filter(
                inventory => inventory.id == data["id"]
              )
          ]

        }
      );
    return selectedInventory;
  }
 
  changeDisplayItemUnitOfMeasure(inventory: Inventory, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (inventory.quantity! % itemUnitOfMeasure.quantity! == 0) {

      inventory.displayQuantity = inventory.quantity! / itemUnitOfMeasure.quantity!;
      inventory.itemPackageType!.displayItemUnitOfMeasure = itemUnitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the inventory's quantity ${ 
          inventory.quantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }

  exportResult() {

  }
  inventoryTableRecordPerPageChanged(recordPerPage: any) {
    console.log(`recordPerPage is changed to ${recordPerPage}`);

  }

  inventoryDisplayOptionChanged() {
    console.log(`inventory display is changed to ${this.inventoryDisplayOption}`);

    // setup the display based on the display option
    this.processInventoryQueryResult(this.inventories);
  }

  reverseInventory(inventory: Inventory) {
    
    this.isSpinning = true;
    if (inventory.receiptId != null) { 
        this.inventoryService.reverseReceivedInventory(inventory, true, true).subscribe(
          {
            next: () => {
              this.messageService.success(this.i18n.fanyi('message.action.success'));
              this.isSpinning = false;
              this.search();
            }, 
            error: () => {
                    
              this.isSpinning = false; 
            }
          }

        )
    } 
    else if (inventory.workOrderId != null) { 
      this.workOrderService.reverseProduction(inventory.workOrderId, inventory.lpn!).subscribe(
        {
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.isSpinning = false;
            this.search();
          }, 
          error: () => {
                  
            this.isSpinning = false; 
          }
        }

      )
  } 

  }

}
