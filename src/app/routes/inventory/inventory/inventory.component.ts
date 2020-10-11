import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Client } from '../../common/models/client';
import { ReasonCode } from '../../common/models/reason-code';
import { ReasonCodeType } from '../../common/models/reason-code-type.enum';
import { ClientService } from '../../common/services/client.service';
import { ReasonCodeService } from '../../common/services/reason-code.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { Inventory } from '../models/inventory';
import { InventoryStatus } from '../models/inventory-status';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';
import { ItemPackageType } from '../models/item-package-type';
import { InventoryService } from '../services/inventory.service';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
  selector: 'app-inventory-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.less'],
})
export class InventoryInventoryComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: FormGroup;
  inventoryMovementForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  inventories: Inventory[] = [];
  listOfDisplayInventories: Inventory[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByLpn = [];
  filtersByItem = [];
  filtersByItemPackageType = [];
  filtersByLocation = [];
  filtersByInventoryStatus = [];
  // Save filters that already selected
  selectedFiltersByLpn: string[] = [];
  selectedFiltersByItem: string[] = [];
  selectedFiltersByItemPackageType: string[] = [];
  selectedFiltersByLocation: string[] = [];
  selectedFiltersByInventoryStatus: string[] = [];

  inventoryToBeRemoved!: Inventory;
  inventoryRemovalModal!: NzModalRef;

  documentNumber = '';
  comment = '';

  isCollapse = false;

  inventoryMoveModal!: NzModalRef;

  mapOfInprocessInventoryId: { [key: string]: boolean } = {};

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private locationService: LocationService,
    private messageService: NzMessageService,
  ) {}

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
        } else {
          this.search();
        }
      }
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.inventories = [];
    this.listOfDisplayInventories = [];

    this.filtersByLpn = [];
    this.filtersByItem = [];
    this.filtersByItemPackageType = [];
    this.filtersByLocation = [];
    this.filtersByInventoryStatus = [];
  }
  search(id?: number): void {
    this.searching = true;
    this.searchResult = '';
    if (id) {
      this.inventoryService.getInventoryById(id).subscribe(
        inventoryRes => {
          this.processInventoryQueryResult([inventoryRes]);
          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: 1,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
    } else {
      this.inventoryService
        .getInventories(
          this.searchForm.value.taggedClients,
          this.searchForm.value.taggedItemFamilies,
          this.searchForm.value.itemName,
          this.searchForm.value.location,
          this.searchForm.value.lpn,
        )
        .subscribe(
          inventoryRes => {
            this.processInventoryQueryResult(inventoryRes);
            this.searching = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: inventoryRes.length,
            });
          },
          () => {
            this.searching = false;
            this.searchResult = '';
          },
        );
    }
  }

  processInventoryQueryResult(inventories: Inventory[]): void {
    this.inventories = inventories;
    this.listOfDisplayInventories = inventories;

    this.filtersByLpn = [];
    this.filtersByItem = [];
    this.filtersByItemPackageType = [];
    this.filtersByLocation = [];
    this.filtersByInventoryStatus = [];

    const existingLpn = new Set();
    const existingItemId = new Set();
    const existingItemPackageTypeId = new Set();
    const existingLocation = new Set();
    const existingInventoryStatusId = new Set();
 
  }

  currentPageDataChange($event: Inventory[]): void {
    this.listOfDisplayInventories = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(
    selectedFiltersByLpn: string[],
    selectedFiltersByItem: string[],
    selectedFiltersByItemPackageType: string[],
    selectedFiltersByLocation: string[],
    selectedFiltersByInventoryStatus: string[],
  ): void {
    this.selectedFiltersByLpn = selectedFiltersByLpn;
    this.selectedFiltersByItem = selectedFiltersByItem;
    this.selectedFiltersByItemPackageType = selectedFiltersByItemPackageType;
    this.selectedFiltersByLocation = selectedFiltersByLocation;
    this.selectedFiltersByInventoryStatus = selectedFiltersByInventoryStatus;
    this.sortAndFilter();
  }

  sortAndFilter(): void {
    // filter data
    const filterFunc = (inventory: {
      id: number;
      lpn: string;
      location: WarehouseLocation;
      item: Item;
      itemPackageType: ItemPackageType;
      inventoryStatus: InventoryStatus;
    }) =>
      (this.selectedFiltersByLpn.length
        ? this.selectedFiltersByLpn.some(lpn => inventory.lpn.indexOf(lpn) !== -1)
        : true) &&
      (this.selectedFiltersByItem.length
        ? this.selectedFiltersByItem.some(id => inventory.item !== null && inventory.item.id === +id)
        : true) &&
      (this.selectedFiltersByItemPackageType.length
        ? this.selectedFiltersByItemPackageType.some(
            id => inventory.itemPackageType !== null && inventory.itemPackageType.id === +id,
          )
        : true) &&
      (this.selectedFiltersByLocation.length
        ? this.selectedFiltersByLocation.some(location => inventory.location.name.indexOf(location) !== -1)
        : true) &&
      (this.selectedFiltersByInventoryStatus.length
        ? this.selectedFiltersByInventoryStatus.some(
            id => inventory.inventoryStatus !== null && inventory.inventoryStatus.id === +id,
          )
        : true);
        

    // sort data
    
  }
  adjustInventory(inventory: Inventory): void {
    console.log('will adjust inventory: ' + JSON.stringify(inventory));
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
    this.inventoryService.adjustDownInventory(inventory, this.documentNumber, this.comment).subscribe(
      inventoryRes => {
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        if (inventoryRes.lockedForAdjust === true) {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.request-success'));
        } else {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
        }
        this.search();
      },
      () => {
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        this.messageService.error(this.i18n.fanyi('message.action.fail'));
      },
    );

    this.inventoryRemovalModal.destroy();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],
      taggedItemFamilies: [null],
      itemName: [null],
      location: [null],
      lpn: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
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
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location!.name, disabled: true }),
      destinationLocation: [null],
      immediateMove: [false],
    });

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
}
