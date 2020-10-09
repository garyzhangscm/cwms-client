import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { EmergencyReplenishmentConfiguration } from '../models/emergency-replenishment-configuration';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { ItemFamily } from '../models/item-family';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EmergencyReplenishmentConfigurationService } from '../services/emergency-replenishment-configuration.service';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { ItemFamilyService } from '../services/item-family.service';
import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InventoryActivity } from '../models/inventory-activity';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';
import { InventoryStatus } from '../models/inventory-status';
import { Client } from '../../common/models/client';

@Component({
  selector: 'app-inventory-emergency-replenishment-config',
  templateUrl: './emergency-replenishment-config.component.html',
  styleUrls: ['./emergency-replenishment-config.component.less'],
})
export class InventoryEmergencyReplenishmentConfigComponent implements OnInit {
  // Select control for clients and item families
  unitOfMeasures: UnitOfMeasure[] = [];

  itemFamilies: ItemFamily[] = [];

  // Form related data and functions
  searchForm: FormGroup;

  searching = false;

  // Table data for display
  listOfAllConfigurations: EmergencyReplenishmentConfiguration[] = [];
  listOfDisplayConfigurations: EmergencyReplenishmentConfiguration[] = [];
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
    private emergencyReplenishmentConfigurationService: EmergencyReplenishmentConfigurationService,
    private unitOfMeasureService: UnitOfMeasureService,
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllConfigurations = [];
    this.listOfDisplayConfigurations = [];
  }
  search(): void {
    this.searching = true;
    this.emergencyReplenishmentConfigurationService
      .getEmergencyReplenishmentConfiguration()
      .subscribe(configurationRes => {
        this.listOfAllConfigurations = configurationRes;
        this.listOfDisplayConfigurations = configurationRes;
        this.searching = false;
      });
  }

  currentPageDataChange($event: EmergencyReplenishmentConfiguration[]): void {
    this.listOfDisplayConfigurations = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    if (this.sortKey && this.sortValue) {
      this.listOfDisplayConfigurations = this.listOfAllConfigurations.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayConfigurations = this.listOfAllConfigurations;
    }
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.replenishment.emergency.config'));
    this.initSearchForm();
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      unitOfMeasure: [null],
      itemFamily: [null],
      itemName: [null],
    });

    // initiate the select control
    this.unitOfMeasureService.loadUnitOfMeasures().subscribe((unitOfMeasuresRes: UnitOfMeasure[]) => {
      this.unitOfMeasures = unitOfMeasuresRes;
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyRes: ItemFamily[]) => {
      this.itemFamilies = itemFamilyRes;
    });
  }
}
