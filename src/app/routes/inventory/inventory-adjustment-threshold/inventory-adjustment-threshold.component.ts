import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { InventoryAdjustmentThreshold } from '../models/inventory-adjustment-threshold';
import { InventoryQuantityChangeType } from '../models/inventory-quantity-change-type.enum';
import { ItemFamily } from '../models/item-family';
import { InventoryAdjustmentThresholdService } from '../services/inventory-adjustment-threshold.service';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
    selector: 'app-inventory-inventory-adjustment-threshold',
    templateUrl: './inventory-adjustment-threshold.component.html',
    styleUrls: ['./inventory-adjustment-threshold.component.less'],
    standalone: false
})
export class InventoryInventoryAdjustmentThresholdComponent implements OnInit {
  listOfColumns: Array<ColumnItem<InventoryAdjustmentThreshold>> = [
    {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item-family',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableObjField(a.itemFamily, b.itemFamily, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'client',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'inventory-quantity-change-type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableString(a.type, b.type),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'user',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableObjField(a.user, b.user, 'username'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'role.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableObjField(a.role, b.role, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'inventory-adjustment-threshold.quantity-threshold',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableNumber(a.quantityThreshold, b.quantityThreshold),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'inventory-adjustment-threshold.cost-threshold',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareNullableNumber(a.costThreshold, b.costThreshold),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      showSort: true,
      sortOrder: null,
      sortFn: (a: InventoryAdjustmentThreshold, b: InventoryAdjustmentThreshold) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], inventoryAdjustmentThreshold: InventoryAdjustmentThreshold) => list.some(enabled => inventoryAdjustmentThreshold.enabled === enabled),
      showFilter: true
    },
  ];

  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  inventoryQuantityChangeTypes = InventoryQuantityChangeType;

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;

  // Table data for display
  listOfAllInventoryAdjustmentThresholds: InventoryAdjustmentThreshold[] = [];
  listOfDisplayInventoryAdjustmentThresholds: InventoryAdjustmentThreshold[] = [];


  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private inventoryAdjustmentThresholdService: InventoryAdjustmentThresholdService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
    private utilService: UtilService,
    private userService: UserService,
  ) {
    userService.isCurrentPageDisplayOnly("/inventory/inventory-adjustment-threshold").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                           
  
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventoryAdjustmentThresholds = [];
    this.listOfDisplayInventoryAdjustmentThresholds = [];
  }
  search(): void {
    this.searching = true;
    this.inventoryAdjustmentThresholdService
      .getInventoryAdjustmentThresholds(
        this.searchForm.value.inventoryQuantityChangeType,
        this.searchForm.value.taggedClients,
        this.searchForm.value.taggedItemFamilies,
        this.searchForm.value.itemName,
        this.searchForm.value.username,
        this.searchForm.value.roleName,
        this.searchForm.value.enabled,
      )
      .subscribe(inventoryAdjustmentThresholdRes => {
        this.listOfAllInventoryAdjustmentThresholds = inventoryAdjustmentThresholdRes;
        this.listOfDisplayInventoryAdjustmentThresholds = inventoryAdjustmentThresholdRes;
        this.searching = false;
      });
  }

  currentPageDataChange($event: InventoryAdjustmentThreshold[]): void {
    this.listOfDisplayInventoryAdjustmentThresholds = $event;
  }


  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory-adjustment-threshold'));
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      inventoryQuantityChangeType: [null],
      taggedClients: [null],
      taggedItemFamilies: [null],
      itemName: [null],
      username: [null],
      roleName: [null],
      enabled: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id!.toString() }));
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }
}
