import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { ReasonCode } from '../../common/models/reason-code';
import { ReasonCodeType } from '../../common/models/reason-code-type.enum';
import { ReasonCodeService } from '../../common/services/reason-code.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Inventory } from '../models/inventory';
import { InventoryStatus } from '../models/inventory-status';
import { InventoryStatusService } from '../services/inventory-status.service';
import { InventoryService } from '../services/inventory.service';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-inventory-inventory-adjust',
  templateUrl: './inventory-adjust.component.html',
  styleUrls: ['./inventory-adjust.component.less'],
})
export class InventoryInventoryAdjustComponent implements OnInit {

  listOfColumns: ColumnItem[] = [
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


  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private reasonCodeService: ReasonCodeService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private inventoryStatusService: InventoryStatusService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.header.title');
  }

  // Select control for Location Group Types
  locationGroupTypes: Array<{ label: string; value: string }> = [];
  locationGroups: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: FormGroup;
  pageTitle: string;
  isSpinning = false;
  currentInventory!: Inventory;
  addInventoryModal!: NzModalRef;
  availableInventoryStatuses!: InventoryStatus[];

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

  documentNumber = '';
  comment = '';
  // Inventory in locations
  // key: locatin id
  // value: list of inventroy in the location
  mapOfInventories: { [key: string]: Inventory[] } = {};

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
        this.locationGroups.push({ label: locationGroup.description, value: locationGroup.id.toString() }),
      );
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.locationName) {
        const expand = params.hasOwnProperty('expand') ? params.hasOwnProperty('expand') : false;
        this.searchForm.controls.location.setValue(params.locationName);
        this.search(expand);
      }
    });

    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
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
        this.searchForm.controls.taggedLocationGroupTypes.value,
        this.searchForm.controls.taggedLocationGroups.value,
        this.searchForm.controls.location.value,
      )
      .subscribe(
        locationRes => {
          this.listOfAllLocations = locationRes;
          this.listOfDisplayLocations = locationRes;
          if (expand) {
            // expand all the result
            this.listOfDisplayLocations.forEach(location => {
              this.expandSet.add(location.id);
              this.showInventoryDetails(location);
            });
          }


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
      this.expandSet.add(location.id);
      this.showInventoryDetails(location);
    } else {
      this.expandSet.delete(location.id);
    }
  }

  currentPageDataChange($event: WarehouseLocation[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocations = $event;
  }


  showInventoryDetails(location: WarehouseLocation): void {
    console.log(`expanded: ${JSON.stringify(location)}`);
    this.inventoryService.getInventoriesByLocationId(location.id).subscribe(inventories => {
      this.mapOfInventories[location.id] = [...inventories];
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
    this.inventoryService.adjustDownInventory(this.inventoryToBeRemoved).subscribe(res => {
      this.search();
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
        this.addInventory(this.currentInventory);
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
      locationName: location.name,
      virtual: false, // default to NON virtual inventory. It make no sense to adjust virtual inventory
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        allowCartonization: undefined,
        itemPackageTypes: [
          {
            id: undefined,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
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
        name: '',
        itemUnitOfMeasures: [],
      },
      quantity: 0,
      inventoryStatus: {
        id: undefined,
        name: '',
        description: '',
      },

    };
  }


  lpnChanged(event: Event): void {
    this.currentInventory.lpn = (event.target as HTMLInputElement).value;
  }
  setupDefaultInventoryValue(): void {
    if (this.availableInventoryStatuses.length === 1) {
      this.currentInventory.inventoryStatus = this.availableInventoryStatuses[0];
    }
  }

  itemNumberChanged(event: Event): void {
    this.itemService.getItems((event.target as HTMLInputElement).value.trim()).subscribe(itemRes => {
      if (itemRes.length > 0) {
        // with a name, we should only get one item information
        this.currentInventory.item = itemRes[0];
      }
    });
  }
  itemPackageTypeChange( ): void {
    const newItemPackageTypeName: string = this.currentInventory.itemPackageType!.name!;
    const itemPackageTypes = this.currentInventory.item!.itemPackageTypes.filter(
      itemPackageType => itemPackageType.name === newItemPackageTypeName,
    );
    if (itemPackageTypes.length === 1) {
      this.currentInventory.itemPackageType = itemPackageTypes[0];
    }
  }
  inventoryStatusChange( ): void {
    const newInventoryStatusName: string = this.currentInventory.inventoryStatus!.name;
    console.log(`Inventory status name changed to ${JSON.stringify(newInventoryStatusName)}`);
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        console.log(`Inventory status changed to ${JSON.stringify(inventoryStatus)}`);
        this.currentInventory.inventoryStatus = inventoryStatus;
      }
    });
  }

  addInventory(inventory: Inventory): void {
    console.log(`Start to add inventory: ${JSON.stringify(inventory)}`);
    this.isSpinning = true;
    this.inventoryService.addInventory(inventory, this.documentNumber, this.comment).subscribe(inventoryRes => {
      // display the newly added inventory
      this.searchForm.controls.location.setValue(inventory.location!.name);

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

    this.searchForm.controls.location.setValue(selectedLocationName);
  }
  processItemQueryResult(selectedItemName: any): void {
    this.itemService.getItems(selectedItemName).subscribe(itemRes => {
      if (itemRes.length > 0) {
        // with a name, we should only get one item information
        this.currentInventory.item = itemRes[0];
      }
    });

  }
}
