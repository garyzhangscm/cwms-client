import { Component, OnInit } from '@angular/core';
import { TitleService, _HttpClient } from '@delon/theme';

import { FormBuilder, FormGroup } from '@angular/forms';

import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ClientService } from '../../common/services/client.service';
import { ItemFamilyService } from '../services/item-family.service';

import { Client } from '../../common/models/client';
import { InventoryAdjustmentThreshold } from '../models/inventory-adjustment-threshold';
import { InventoryQuantityChangeType } from '../models/inventory-quantity-change-type.enum';
import { ItemFamily } from '../models/item-family';
import { InventoryAdjustmentThresholdService } from '../services/inventory-adjustment-threshold.service';

@Component({
  selector: 'app-inventory-inventory-adjustment-threshold',
  templateUrl: './inventory-adjustment-threshold.component.html',
  styleUrls: ['./inventory-adjustment-threshold.component.less'],
})
export class InventoryInventoryAdjustmentThresholdComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  inventoryQuantityChangeTypes = InventoryQuantityChangeType;

  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;

  // Table data for display
  listOfAllInventoryAdjustmentThresholds: InventoryAdjustmentThreshold[] = [];
  listOfDisplayInventoryAdjustmentThresholds: InventoryAdjustmentThreshold[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private inventoryAdjustmentThresholdService: InventoryAdjustmentThresholdService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
  ) {}

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
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data 
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
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }
}
