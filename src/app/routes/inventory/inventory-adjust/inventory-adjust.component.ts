import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ReasonCode } from '../../common/models/reason-code';
import { ReasonCodeType } from '../../common/models/reason-code-type.enum';
import { ReasonCodeService } from '../../common/services/reason-code.service';
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
  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private reasonCodeService: ReasonCodeService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private inventoryStatusService: InventoryStatusService,
    private itemService: ItemService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.header.title');
  }

  // Select control for Location Group Types
  locationGroupTypes: Array<{ label: string; value: string }> = [];
  locationGroups: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: FormGroup;
  pageTitle: string;

  currentInventory!: Inventory;
  addInventoryModal!: NzModalRef;
  availableInventoryStatuses!: InventoryStatus[];

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllLocations: WarehouseLocation[] = [];
  listOfDisplayLocations: WarehouseLocation[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByLocationGroup = [];
  // Save filters that already selected
  selectedFiltersByLocationGroup: string[] = [];

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

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
    this.filtersByLocationGroup = [];
  }

  search(expand?: boolean): void {
    this.searching = true;
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
              this.mapOfExpandedId[location.id] = true;
              this.showInventoryDetails(location);
            });
          }

          this.filtersByLocationGroup = [];
          const existingLocationGroupId = new Set();

          

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: locationRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  currentPageDataChange($event: WarehouseLocation[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayLocations = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByLocationGroup: string[]): void {
    this.selectedFiltersByLocationGroup = selectedFiltersByLocationGroup;
    this.sortAndFilter();
  }

  sortAndFilter(): void {
    // filter data
    const filterFunc = (item: { locationGroup: LocationGroup }) =>
      this.selectedFiltersByLocationGroup.length
        ? this.selectedFiltersByLocationGroup.some(id => item.locationGroup.id === +id)
        : true;

    const data = this.listOfAllLocations.filter(item => filterFunc(item));

    // sort data 
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
    this.currentInventory = {
      id: undefined,
      lpn: '',
      location,
      locationName: location.name,
      item: undefined,
      itemPackageType: undefined,
      quantity: undefined,
      inventoryStatus: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
    };
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

  lpnChanged(lpn: string): void {
    this.currentInventory.lpn = lpn;
  }
  setupDefaultInventoryValue(): void {
    if (this.availableInventoryStatuses.length === 1) {
      this.currentInventory.inventoryStatus = this.availableInventoryStatuses[0];
    }
  }

  itemNumberChanged(itemNumber: string): void {
    this.itemService.getItems(itemNumber).subscribe(itemRes => {
      if (itemRes.length > 0) {
        // with a name, we should only get one item information
        this.currentInventory.item = itemRes[0];
      }
    });
  }
  itemPackageTypeChange(newItemPackageTypeName: string): void {
    const itemPackageTypes = this.currentInventory.item!.itemPackageTypes.filter(
      itemPackageType => itemPackageType.name === newItemPackageTypeName,
    );
    if (itemPackageTypes.length === 1) {
      this.currentInventory.itemPackageType = itemPackageTypes[0];
    }
  }
  inventoryStatusChange(newInventoryStatusName: string): void {
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
    this.inventoryService.addInventory(inventory, this.documentNumber, this.comment).subscribe(inventoryRes => {
      // display the newly added inventory
      this.searchForm.controls.location.setValue(inventoryRes.location!.name);

      if (inventoryRes.lockedForAdjust === true) {
        this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.request-success'));
        this.search();
      } else {
        this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
        this.search(true);
      }
    });
  }
}
