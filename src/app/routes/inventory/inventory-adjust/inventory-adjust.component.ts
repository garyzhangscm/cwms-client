import { formatDate } from '@angular/common';
import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService,  } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ReasonCode } from '../../common/models/reason-code';
import { ReasonCodeType } from '../../common/models/reason-code-type.enum';
import { ClientService } from '../../common/services/client.service';
import { ReasonCodeService } from '../../common/services/reason-code.service';
import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Inventory } from '../models/inventory';
import { InventoryStatus } from '../models/inventory-status'; 
import { ItemUnitOfMeasure } from '../models/item-unit-of-measure';
import { InventoryStatusService } from '../services/inventory-status.service';
import { InventoryService } from '../services/inventory.service';
import { ItemService } from '../services/item.service';

@Component({
    selector: 'app-inventory-inventory-adjust',
    templateUrl: './inventory-adjust.component.html',
    styleUrls: ['./inventory-adjust.component.less'],
    standalone: false
})
export class InventoryInventoryAdjustComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  threePartyLogisticsFlag = false;

  listOfColumns: Array<ColumnItem<WarehouseLocation>> = [
    {
      name: 'location.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location-group',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableObjField(a.locationGroup, b.locationGroup, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.aisle',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableString(a.aisle, b.aisle),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.length',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.length, b.length),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.width',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.width, b.width),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.height',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.height, b.height),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.capacity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.capacity, b.capacity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.fillPercentage',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.fillPercentage, b.fillPercentage),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.currentVolume',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.currentVolume, b.currentVolume),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.pendingVolume',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.pendingVolume, b.pendingVolume),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.putawaySequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.putawaySequence, b.putawaySequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.pickSequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.pickSequence, b.pickSequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location.countSequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareNullableNumber(a.countSequence, b.countSequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.locked',
      showSort: true,
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareBoolean(a.locked, b.locked),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], location: WarehouseLocation) => list.some(locked => location.locked === locked),
      showFilter: true
    },
    
  ];

  currentAdjustUnitOfMeasure?: ItemUnitOfMeasure;

  displayOnly = false;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['add-inventory', false],
    ['empty-location', false],
    ['adjust-inventory-quantity', false],
    ['change-inventory-attribute', false],
    ['remove-inventory', false],
  ]);

  constructor(
    private fb: UntypedFormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService, 
    private modalService: NzModalService,
    private reasonCodeService: ReasonCodeService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private inventoryStatusService: InventoryStatusService,
    private companyService: CompanyService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private clientService: ClientService,
    private localCacheService: LocalCacheService,
    private userService: UserService,
  ) {
    userService.isCurrentPageDisplayOnly("/inventory/inventory-adjust").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );
    userService.getUserPermissionByWebPage("/inventory/inventory-adjust").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    }); 
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.header.title');
  }

  // Select control for Location Group Types
  locationGroupTypes: Array<{ label: string; value: string }> = [];
  locationGroups: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: UntypedFormGroup;
  pageTitle: string;
  isSpinning = false;
  currentInventory!: Inventory;
  addInventoryModal!: NzModalRef;
  
  validInventoryStatuses: InventoryStatus[] = [];
  availableInventoryStatus?: InventoryStatus; 

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllLocations: WarehouseLocation[] = [];
  listOfDisplayLocations: WarehouseLocation[] = [];

  expandSet = new Set<number>();

  inventoryToBeRemoved!: Inventory;
  inventoryRemovalModal!: NzModalRef;
  inventoryRemovalReason!: ReasonCode;
  listOfReasons: ReasonCode[] = [];

  emptyLocationlModal!: NzModalRef;
  emptyLocationPercent = 0;
  emptyLocationInventoryCount = 0;
  emptyLocationCurrentInventoryIndex = 0;

  documentNumber = '';
  comment = '';
  // Inventory in locations
  // key: locatin id
  // value: list of inventroy in the location
  mapOfInventories: { [key: string]: Inventory[] } = {};
  availableClients: Client[] = [];

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.adjust.header.title'));
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
      taggedLocationGroups: [null],
      location: [null],
    });

    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      locationGroupTypeList.forEach(locationGroupType =>
        this.locationGroupTypes.push({ label: locationGroupType.description, value: locationGroupType.id.toString() }),
      );
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      locationGroupList.forEach(locationGroup =>
        this.locationGroups.push({ label: locationGroup.description!, value: locationGroup.id!.toString() }),
      );
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['locationName']) {
        const expand = params.hasOwnProperty('expand') ? params.hasOwnProperty('expand') : false;
        this.searchForm.value.location.setValue(params['locationName']);
        this.search(expand);
      }
    });

    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));

    
      this.inventoryStatusService.getAvailableInventoryStatuses()
      .subscribe(inventoryStatuses => {
        if (inventoryStatuses.length > 0) {
          this.availableInventoryStatus = inventoryStatuses[0];
        }
      });

    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });

    // check if 3pl is enabled
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {
        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        } 
      },  
    });
  }
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllLocations = [];
    this.listOfDisplayLocations = [];

  }

  search(expand?: boolean): void { 
    this.isSpinning = true;
    this.searchResult = '';
    this.locationService
      .getLocations(
        this.searchForm.value.taggedLocationGroupTypes.value,
        this.searchForm.value.taggedLocationGroups.value,
        this.searchForm.value.location.value,
      )
      .subscribe(
        locationRes => {
          this.listOfAllLocations = locationRes;
          this.listOfDisplayLocations = locationRes;
          if (expand) {
            // expand all the result
            this.listOfDisplayLocations.forEach(location => {
              this.expandSet.add(location.id!); 
            });
          }
          this.listOfDisplayLocations.forEach(location => {
            if(this.expandSet.has(location.id!)) {
              this.showInventoryDetails(location);
            }
          });


          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: locationRes.length,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }

  onExpandChange(location: WarehouseLocation, checked: boolean): void {
    if (checked) {
      this.expandSet.add(location.id!);
      this.showInventoryDetails(location);
    } else {
      this.expandSet.delete(location.id!);
    }
  }

  currentPageDataChange($event: WarehouseLocation[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocations = $event;
  }


  showInventoryDetails(location: WarehouseLocation): void {
    // console.log(`expanded: ${JSON.stringify(location)}`);
    this.inventoryService.getInventoriesByLocationId(location.id!).subscribe(inventories => {
      this.mapOfInventories[location.id!] = [...inventories];
    });
  }

  openRemoveInventoryModal(
    inventory: Inventory,
    tplInventoryRemovalModalTitle: TemplateRef<{}>,
    tplInventoryRemovalModalContent: TemplateRef<{}>,
  ): void {
    this.inventoryToBeRemoved = inventory;

    this.inventoryRemovalModal = this.modalService.create({
      nzTitle: tplInventoryRemovalModalTitle,
      nzContent: tplInventoryRemovalModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryRemovalModal.destroy();
        this.search();
      },
      nzOnOk: () => {
        this.removeInventory();
        this.search();
      },
      nzWidth: 1000,
    });
    this.inventoryRemovalModal.afterOpen.subscribe(() => this.initReasonList());
  }

  initReasonList(): void {
    this.reasonCodeService.loadReasonCodeByType(ReasonCodeType.Inventory_Adjust).subscribe(res => {
      this.listOfReasons = res;
    });
  }

  removeInventory(): void {
    this.inventoryService.adjustDownInventory(this.inventoryToBeRemoved).subscribe({
      next: () => {
        // refresh only that location
        this.searchForm.value.location.setValue(this.inventoryToBeRemoved.locationName);
        this.search(true);
      }
    }); 

    this.inventoryRemovalModal.destroy();
  }

  openAddInventoryModal(
    location: WarehouseLocation,
    tplAddInventoryModalTitle: TemplateRef<{}>,
    tplAddInventoryModalContent: TemplateRef<{}>,
  ): void {
    this.currentInventory = this.getEmptyInventory(location);
    this.documentNumber = '';
    this.comment = '';

    this.currentAdjustUnitOfMeasure = undefined;

    // show the model
    this.addInventoryModal = this.modalService.create({
      nzTitle: tplAddInventoryModalTitle,
      nzContent: tplAddInventoryModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addInventoryModal.destroy();
        // refresh after cancel
        this.search();
      },
      nzOnOk: () => {
        
        let actualReceivingInventory : Inventory = { 
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          lpn: this.currentInventory!.lpn,
          item: this.currentInventory!.item,
          itemPackageType: this.currentInventory!.itemPackageType,
          inventoryStatus: this.currentInventory!.inventoryStatus,
          quantity: this.currentInventory!.quantity,
          locationId: this.currentInventory!.locationId,
          location: this.currentInventory?.location,
          color: this.currentInventory?.color,
          style: this.currentInventory?.style,
          productSize: this.currentInventory?.productSize,
          attribute1: this.currentInventory?.attribute1,
          attribute2: this.currentInventory?.attribute2,
          attribute3: this.currentInventory?.attribute3,
          attribute4: this.currentInventory?.attribute4,
          attribute5: this.currentInventory?.attribute5
        }
        if (this.currentAdjustUnitOfMeasure && this.currentAdjustUnitOfMeasure!.quantity! > 1) {
          actualReceivingInventory.quantity = actualReceivingInventory.quantity! * this.currentAdjustUnitOfMeasure!.quantity!;
        }
        this.addInventory(actualReceivingInventory);
      },
      nzWidth: 1000,
    });
    this.addInventoryModal.afterOpen.subscribe(() => this.setupDefaultInventoryValue());
  }

  
  getEmptyInventory(
    location: WarehouseLocation,): Inventory {
    return {
      id: undefined,
      lpn: '',
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      location: location,
      locationId: location.id,
      locationName: location.name,
      virtual: false, // default to NON virtual inventory. It make no sense to adjust virtual inventory
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        allowCartonization: undefined,
        itemPackageTypes: [
          {
            id: undefined,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            companyId: this.companyService.getCurrentCompany()!.id,
            description: '',
            name: '',
            itemUnitOfMeasures: [],
          },
        ],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      itemPackageType: {
        description: '',
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        itemUnitOfMeasures: [],
      },
      quantity: 0,
      inventoryStatus: {
        id: undefined,
        name: '',
        description: '',
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
      },
      
      color: "",
      productSize: "",
      style: "",

    };
  }

  openEmptyLocationModal(
    location: WarehouseLocation,
    tplEmptyLocationModalTitle: TemplateRef<{}>,
    tplEmptyLocationModalContent: TemplateRef<{}>,
  ): void { 
 
    this.emptyLocationInventoryCount = 0;
    this.emptyLocationCurrentInventoryIndex = 0;

    this.emptyLocationlModal = this.modalService.create({
      nzTitle: tplEmptyLocationModalTitle,
      nzContent: tplEmptyLocationModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOkLoading: true,
      nzOnCancel: () => {
        console.log(`nzOnCancel!`)
        this.emptyLocationlModal.destroy();
        this.search();
      },
      nzOnOk: () => {
        this.emptyLocation(location); 
        // we will keep the modal on until we remove all the inventory
        return false;
      },
      nzWidth: 1000,
    }); 
    this.emptyLocationlModal.afterOpen.subscribe(() => this.initInventoryList(location));
  }
  initInventoryList(location: WarehouseLocation) {   
    this.inventoryService.getInventoriesByLocationId(location.id!).subscribe({
      next: (inventories) => {
        this.mapOfInventories[location.id!] = [...inventories]; 
        this.emptyLocationInventoryCount = this.mapOfInventories[location.id!].length;
        this.emptyLocationCurrentInventoryIndex = 0;
        this.emptyLocationlModal.updateConfig({ 
          nzOkLoading: false,
        })
      }, 
    }); 
  }
  emptyLocation(location: WarehouseLocation) {   
    this.emptyLocationlModal.updateConfig({ 
      nzOkLoading: true,
    }); 
    this.removeInventoryFromList(location.name!, this.mapOfInventories[location.id!])
    
  }
  // remove the first inventory from the list
  removeInventoryFromList(locationName: string, inventories: Inventory[]) {
    // see the current inventory index that we are trying to remove
    this.emptyLocationCurrentInventoryIndex =
        this.emptyLocationInventoryCount - inventories.length; 
    this.emptyLocationPercent = +(this.emptyLocationCurrentInventoryIndex * 100 / this.emptyLocationInventoryCount).toFixed(2);
    if (inventories.length == 0) { 
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.emptyLocationlModal.state
      // if (this.emptyLocationlModal.state == NzModalState.OPEN) {
        if (this.emptyLocationlModal.state == 0) {
        this.emptyLocationlModal.destroy();
      }
      return;
    } 
    this.inventoryService.adjustDownInventory(
      inventories[0], undefined, 
      `Remove Inventory ${  inventories[0].lpn  } to empty location ${  locationName}`).subscribe({
      next: () => {
         
        this.removeInventoryFromList(locationName, inventories.slice(1, inventories.length + 1))
        
      }
    })
  }

  lpnChanged(event: Event): void {
    this.currentInventory.lpn = (event.target as HTMLInputElement).value;
  } 

  setupDefaultInventoryValue(): void { 
     
    if (this.validInventoryStatuses.length === 1) {
      this.currentInventory.inventoryStatus = this.validInventoryStatuses[0];
    }
    else if (this.availableInventoryStatus != null) {
      this.currentInventory.inventoryStatus = this.availableInventoryStatus;

    } 
  }

  itemNumberChanged(event: Event): void {
    const itemNumber = (event.target as HTMLInputElement).value.trim();
    if (itemNumber.length == 0) {
      return;
    }
    
    this.newInventoryItemChanged(itemNumber);;

    
  }
  itemPackageTypeChange( ): void {
    const newItemPackageTypeName: string = this.currentInventory.itemPackageType!.name!;
    const itemPackageTypes = this.currentInventory.item!.itemPackageTypes.filter(
      itemPackageType => itemPackageType.name === newItemPackageTypeName,
    );
    if (itemPackageTypes.length === 1) {
      this.currentInventory.itemPackageType = itemPackageTypes[0];
      this.setupNewItemUnitOfMeasure();
    }
  }
  inventoryStatusChange( ): void {
    const newInventoryStatusName: string = this.currentInventory.inventoryStatus!.name;
    // console.log(`Inventory status name changed to ${JSON.stringify(newInventoryStatusName)}`);
    this.validInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        // console.log(`Inventory status changed to ${JSON.stringify(inventoryStatus)}`);
        this.currentInventory.inventoryStatus = inventoryStatus;
      }
    });
  }

  addInventory(inventory: Inventory): void {
    // console.log(`Start to add inventory: ${JSON.stringify(inventory)}`);
    this.isSpinning = true; 
    this.inventoryService.addInventory(inventory, this.documentNumber, this.comment).subscribe(inventoryRes => {
      // display the newly added inventory
      this.searchForm.value.location.setValue(inventory.locationName);

      if (inventoryRes.lockedForAdjust === true) {
        this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.request-success'));
        
        this.isSpinning = false;
        this.search();
      } else {
        this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
        this.isSpinning = false;
        this.search(true);
      }
    }, 
    () => this.isSpinning = false);
  }
  processLocationQueryResult(selectedLocationName: any): void {

    this.searchForm.value.location.setValue(selectedLocationName);
  }
  processItemQueryResult(selectedItemName: any): void {
    this.newInventoryItemChanged(selectedItemName);

  }

  newInventoryItemChanged(newItemName: string): void {
    // make sure we already have a client id in a 3pl environment
    if (this.threePartyLogisticsFlag && this.currentInventory.clientId == null) {

      // do nothing, we will force the user to choose a client
      this.currentInventory.item!.name = newItemName;
      return;
    }
    this.itemService.getItems(newItemName, undefined, undefined, undefined, undefined, 
      this.currentInventory.clientId?.toString()).subscribe(
      {
        next: (itemRes) => {
          if (itemRes.length > 0) {
            // with a name, we should only get one item information
            this.currentInventory.item = itemRes[0];
            if (this.currentInventory.item!.itemPackageTypes.length === 1) {
              this.currentInventory.itemPackageType = this.currentInventory.item!.itemPackageTypes[0];
              this.setupNewItemUnitOfMeasure();
            }
          }
        }, 
        error: () => {
 
        }
    });
  } 

  addInventoryClientIdChanged(clientId: number) {
    console.log(`client id is changed to ${clientId}`);
    console.log(`this.currentInventory.item?.name ${this.currentInventory.item?.name}`);
    this.currentInventory.clientId = clientId;
    if (clientId != null && this.currentInventory.item?.name) { 

        this.newInventoryItemChanged(this.currentInventory.item?.name); 
    }

  }

  
  adjustUnitOfMeasureChanged(itemUnitOfMeasureId: number) { 
    this.currentAdjustUnitOfMeasure = 
        this.currentInventory!.itemPackageType!.itemUnitOfMeasures.find(
          itemUnitOfMeasure => itemUnitOfMeasure.id == itemUnitOfMeasureId
        );
      

  } 

  setupNewItemUnitOfMeasure() {
    if (this.currentInventory && this.currentInventory.itemPackageType) {
      if (this.currentInventory!.itemPackageType.displayItemUnitOfMeasure) {
        // set the display unit of measure
        
        this.currentAdjustUnitOfMeasure = this.currentInventory!.itemPackageType.displayItemUnitOfMeasure;
        // this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure.id);
      }
      else if (this.currentInventory!.itemPackageType.stockItemUnitOfMeasure) {
        // set the display unit of measure
         
        this.currentAdjustUnitOfMeasure = this.currentInventory!.itemPackageType.stockItemUnitOfMeasure;
      }

    }
  }
}
