import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Client } from '../../common/models/client';

import { ClientService } from '../../common/services/client.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { Inventory } from '../models/inventory';
import { ItemFamily } from '../models/item-family';
import { InventoryService } from '../services/inventory.service';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
  selector: 'app-inventory-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.less'],
})
export class InventoryInventoryComponent implements OnInit {

  listOfColumns: ColumnItem[] = [    
    {
          name: 'lpn',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.lpn, b.lpn),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'item',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'item.package-type',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.itemPackageType, b.itemPackageType, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'location',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'inventory.status',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'inventory.locked-for-adjustment',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareBoolean(a.lockedForAdjust, b.lockedForAdjust),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'inventory.pick-id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableNumber(a.pickId, b.pickId),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'inventory.allocated-by-pick-id',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableNumber(a.allocatedByPickId, b.allocatedByPickId),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'movement-path',
          showSort: false,
          sortOrder: null,
          sortFn: null,
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
      ];
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
    private utilService: UtilService,
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
  
  }

  currentPageDataChange($event: Inventory[]): void {
    this.listOfDisplayInventories = $event;
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

  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.searchForm.controls.itemName.setValue(selectedItemName); 
  }
  processLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.inventoryMovementForm.controls.destinationLocation.setValue(selectedLocationName); 
  }
}
