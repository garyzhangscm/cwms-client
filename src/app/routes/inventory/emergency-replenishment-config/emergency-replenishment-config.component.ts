import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { EmergencyReplenishmentConfiguration } from '../models/emergency-replenishment-configuration';
import { InventoryActivity } from '../models/inventory-activity';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';
import { ItemPackageType } from '../models/item-package-type';
import { EmergencyReplenishmentConfigurationService } from '../services/emergency-replenishment-configuration.service';
import { ItemFamilyService } from '../services/item-family.service';
 

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
  searchForm!: FormGroup;

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
 
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.replenishment.emergency.config'));
    this.initSearchForm();
  }

  initSearchForm(): void {
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
