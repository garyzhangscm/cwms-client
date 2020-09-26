import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { InventoryActivity } from '../models/inventory-activity';
import { InventoryActivityService } from '../services/inventory-activity.service';
import { ClientService } from '../../common/services/client.service';
import { ItemFamilyService } from '../services/item-family.service';
import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd';

import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';
import { InventoryStatus } from '../models/inventory-status';

import { Client } from '../../common/models/client';
import { ItemFamily } from '../models/item-family';
import { InventoryActivityType } from '../models/inventory-activity-type.enum';
import * as setHours from 'date-fns/set_hours';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-inventory-inventory-activity',
  templateUrl: './inventory-activity.component.html',
  styleUrls: ['./inventory-activity.component.less'],
})
export class InventoryInventoryActivityComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  inventoryActivityTypes: InventoryActivityType;
  timeDefaultValue = setHours(new Date(), 0);
  // Form related data and functions
  searchForm: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllInventoryActivities: InventoryActivity[] = [];
  listOfDisplayInventoryActivities: InventoryActivity[] = [];
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

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private inventoryActivityService: InventoryActivityService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventoryActivities = [];
    this.listOfDisplayInventoryActivities = [];

    this.filtersByLpn = [];
    this.filtersByItem = [];
    this.filtersByItemPackageType = [];
    this.filtersByLocation = [];
    this.filtersByInventoryStatus = [];
  }
  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.inventoryActivityService
      .getInventoryActivities(
        this.searchForm.value.taggedClients,
        this.searchForm.value.taggedItemFamilies,
        this.searchForm.value.itemName,
        this.searchForm.value.location,
        this.searchForm.value.lpn,
        this.searchForm.value.type,
        this.searchForm.value.activityDateTimeRanger,
        this.searchForm.value.activityDateTimeRanger,
        this.searchForm.value.activityDate,
        this.searchForm.value.username,
      )
      .subscribe(
        inventoryActivityRes => {
          this.processInventoryActivityQueryResult(inventoryActivityRes);
          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryActivityRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  processInventoryActivityQueryResult(inventoryActivities: InventoryActivity[]) {
    this.listOfAllInventoryActivities = inventoryActivities;
    this.listOfDisplayInventoryActivities = inventoryActivities;

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

    this.listOfAllInventoryActivities.forEach(inventoryActivity => {
      if (inventoryActivity.lpn && !existingLpn.has(inventoryActivity.lpn)) {
        this.filtersByLpn.push({
          text: inventoryActivity.lpn,
          value: inventoryActivity.lpn,
        });
        existingLpn.add(inventoryActivity.lpn);
      }
      if (inventoryActivity.item.id && !existingLpn.has(inventoryActivity.item.id)) {
        this.filtersByItem.push({
          text: inventoryActivity.item.name,
          value: inventoryActivity.item.id,
        });
        existingItemId.add(inventoryActivity.item.id);
      }
      if (
        inventoryActivity.itemPackageType.id &&
        !existingItemPackageTypeId.has(inventoryActivity.itemPackageType.id)
      ) {
        this.filtersByItemPackageType.push({
          text: inventoryActivity.itemPackageType.name,
          value: inventoryActivity.itemPackageType.id,
        });
        existingItemPackageTypeId.add(inventoryActivity.item.id);
      }
      if (inventoryActivity.location && !existingLocation.has(inventoryActivity.location)) {
        this.filtersByLocation.push({
          text: inventoryActivity.location,
          value: inventoryActivity.location,
        });
        existingLocation.add(inventoryActivity.location);
      }
      if (
        inventoryActivity.inventoryStatus.id &&
        !existingInventoryStatusId.has(inventoryActivity.inventoryStatus.id)
      ) {
        this.filtersByInventoryStatus.push({
          text: inventoryActivity.inventoryStatus.name,
          value: inventoryActivity.inventoryStatus.id,
        });
        existingInventoryStatusId.add(inventoryActivity.inventoryStatus.id);
      }
    });
  }

  currentPageDataChange($event: InventoryActivity[]): void {
    this.listOfDisplayInventoryActivities = $event;
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
    const filterFunc = (inventoryActivity: {
      id: number;
      lpn: string;
      location: WarehouseLocation;
      item: Item;
      itemPackageType: ItemPackageType;
      inventoryStatus: InventoryStatus;
    }) =>
      (this.selectedFiltersByLpn.length
        ? this.selectedFiltersByLpn.some(lpn => inventoryActivity.lpn.indexOf(lpn) !== -1)
        : true) &&
      (this.selectedFiltersByItem.length
        ? this.selectedFiltersByItem.some(id => inventoryActivity.item !== null && inventoryActivity.item.id === +id)
        : true) &&
      (this.selectedFiltersByItemPackageType.length
        ? this.selectedFiltersByItemPackageType.some(
            id => inventoryActivity.itemPackageType !== null && inventoryActivity.itemPackageType.id === +id,
          )
        : true) &&
      (this.selectedFiltersByLocation.length
        ? this.selectedFiltersByLocation.some(location => inventoryActivity.location.name.indexOf(location) !== -1)
        : true) &&
      (this.selectedFiltersByInventoryStatus.length
        ? this.selectedFiltersByInventoryStatus.some(
            id => inventoryActivity.inventoryStatus !== null && inventoryActivity.inventoryStatus.id === +id,
          )
        : true);
    const data = this.listOfAllInventoryActivities.filter(inventoryActivity => filterFunc(inventoryActivity));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayInventoryActivities = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayInventoryActivities = data;
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory-activity'));
    this.initSearchForm();
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],
      taggedItemFamilies: [null],
      itemName: [null],
      location: [null],
      lpn: [null],
      username: [null],
      type: [null],
      activityDateTimeRanger: [null],
      activityDate: [null],
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
}
