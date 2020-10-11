import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ClientService } from '../../common/services/client.service';
import { InventoryActivity } from '../models/inventory-activity';
import { InventoryActivityService } from '../services/inventory-activity.service';
import { ItemFamilyService } from '../services/item-family.service';

import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryStatus } from '../models/inventory-status';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';

import { formatDate } from '@angular/common'; 
import { Client } from '../../common/models/client';
import { InventoryActivityType } from '../models/inventory-activity-type.enum';
import { ItemFamily } from '../models/item-family';

@Component({
  selector: 'app-inventory-inventory-activity',
  templateUrl: './inventory-activity.component.html',
  styleUrls: ['./inventory-activity.component.less'],
})
export class InventoryInventoryActivityComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  inventoryActivityTypes!: InventoryActivityType; 
  // Form related data and functions
  searchForm!: FormGroup;

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
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory-activity'));
    this.initSearchForm();
  }

  initSearchForm(): void {
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
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }
}
