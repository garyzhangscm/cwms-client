import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Inventory } from '../models/inventory';
import { InventoryService } from '../services/inventory.service';
import { ClientService } from '../../common/services/client.service';
import { ItemFamilyService } from '../services/item-family.service';
import { NzModalService, NzModalRef, NzMessageService } from 'ng-zorro-antd';
import { I18NService } from '@core';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';
import { InventoryStatus } from '../models/inventory-status';
import { Client } from '../../common/models/client';
import { ItemFamily } from '../models/item-family';
import { ReasonCode } from '../../common/models/reason-code';
import { ReasonCodeService } from '../../common/services/reason-code.service';
import { ReasonCodeType } from '../../common/models/reason-code-type.enum';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Router, ActivatedRoute } from '@angular/router';
import { LocationService } from '../../warehouse-layout/services/location.service';

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
  searchForm: FormGroup;
  inventoryMovementForm: FormGroup;

  searching = false;

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

  inventoryToBeRemoved: Inventory;
  inventoryRemovalModal: NzModalRef;

  documentNumber: string;
  comment: string;

  isCollapse = false;

  inventoryMoveModal: NzModalRef;

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

  ngOnInit() {
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
    if (id) {
      this.inventoryService.getInventoryById(id).subscribe(inventoryRes => {
        this.processInventoryQueryResult([inventoryRes]);
        this.searching = false;
      });
    } else {
      this.inventoryService
        .getInventories(
          this.searchForm.value.taggedClients,
          this.searchForm.value.taggedItemFamilies,
          this.searchForm.value.itemName,
          this.searchForm.value.location,
          this.searchForm.value.lpn,
        )
        .subscribe(inventoryRes => {
          this.processInventoryQueryResult(inventoryRes);
          this.searching = false;
        });
    }
  }

  processInventoryQueryResult(inventories: Inventory[]) {
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

    this.inventories.forEach(inventory => {
      if (inventory.lpn && !existingLpn.has(inventory.lpn)) {
        this.filtersByLpn.push({
          text: inventory.lpn,
          value: inventory.lpn,
        });
        existingLpn.add(inventory.lpn);
      }
      if (inventory.item.id && !existingLpn.has(inventory.item.id)) {
        this.filtersByItem.push({
          text: inventory.item.name,
          value: inventory.item.id,
        });
        existingItemId.add(inventory.item.id);
      }
      if (inventory.itemPackageType.id && !existingItemPackageTypeId.has(inventory.itemPackageType.id)) {
        this.filtersByItemPackageType.push({
          text: inventory.itemPackageType.name,
          value: inventory.itemPackageType.id,
        });
        existingItemPackageTypeId.add(inventory.item.id);
      }
      if (inventory.location && !existingLocation.has(inventory.location)) {
        this.filtersByLocation.push({
          text: inventory.location,
          value: inventory.location,
        });
        existingLocation.add(inventory.location);
      }
      if (inventory.inventoryStatus.id && !existingInventoryStatusId.has(inventory.inventoryStatus.id)) {
        this.filtersByInventoryStatus.push({
          text: inventory.inventoryStatus.name,
          value: inventory.inventoryStatus.id,
        });
        existingInventoryStatusId.add(inventory.inventoryStatus.id);
      }
    });
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
  ) {
    this.selectedFiltersByLpn = selectedFiltersByLpn;
    this.selectedFiltersByItem = selectedFiltersByItem;
    this.selectedFiltersByItemPackageType = selectedFiltersByItemPackageType;
    this.selectedFiltersByLocation = selectedFiltersByLocation;
    this.selectedFiltersByInventoryStatus = selectedFiltersByInventoryStatus;
    this.sortAndFilter();
  }

  sortAndFilter() {
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
    const data = this.inventories.filter(inventory => filterFunc(inventory));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayInventories = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayInventories = data;
    }
  }
  adjustInventory(inventory: Inventory) {
    console.log('will adjust inventory: ' + JSON.stringify(inventory));
  }
  openRemoveInventoryModal(
    inventory: Inventory,
    tplInventoryRemovalModalTitle: TemplateRef<{}>,
    tplInventoryRemovalModalContent: TemplateRef<{}>,
  ) {
    this.mapOfInprocessInventoryId[inventory.id] = true;
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
        this.mapOfInprocessInventoryId[inventory.id] = false;
        this.search();
      },
      nzOnOk: () => {
        this.removeInventory(this.inventoryToBeRemoved);
      },
      nzWidth: 1000,
    });
  }

  removeInventory(inventory: Inventory) {
    this.inventoryService.adjustDownInventory(inventory, this.documentNumber, this.comment).subscribe(inventoryRes => {
      this.mapOfInprocessInventoryId[inventory.id] = false;
      if (inventoryRes.lockedForAdjust === true) {
        this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.request-success'));
      } else {
        this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
      }
      this.search();
    });

    this.inventoryRemovalModal.destroy();
  }

  initSearchForm() {
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
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id.toString() }),
      );
    });
  }

  openMoveInventoryModal(
    inventory: Inventory,
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>,
  ) {
    this.mapOfInprocessInventoryId[inventory.id] = true;
    this.inventoryMovementForm = this.fb.group({
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location.name, disabled: true }),
      destinationLocation: [null],
      immediateMove: [null],
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
        this.mapOfInprocessInventoryId[inventory.id] = false;
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
  moveInventory(inventory: Inventory, destinationLocationName: string, immediateMove: boolean) {
    this.locationService.getLocations(null, null, destinationLocationName).subscribe(location => {
      this.inventoryService.move(inventory, location[0], immediateMove).subscribe(inventoryRes => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));

        this.mapOfInprocessInventoryId[inventory.id] = false;
        this.search();
      });
    });
  }
}
