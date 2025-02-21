import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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
    standalone: false
})
export class InventoryEmergencyReplenishmentConfigComponent implements OnInit {

  listOfColumns: Array<ColumnItem<EmergencyReplenishmentConfiguration>> = [
    {
      name: 'sequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => a.sequence - b.sequence,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'unit-of-measure',
      showSort: true,
      sortOrder: null,
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => this.utilService.compareNullableObjField(a.unitOfMeasure, b.unitOfMeasure, 'name'),
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
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.item-family',
      showSort: true,
      sortOrder: null,
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => this.utilService.compareNullableObjField(a.itemFamily, b.itemFamily, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'sourceLocation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => this.utilService.compareNullableObjField(a.sourceLocation, b.sourceLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'sourceLocationGroup',
      showSort: true,
      sortOrder: null,
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => this.utilService.compareNullableObjField(a.sourceLocationGroup, b.sourceLocationGroup, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'destinationLocation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => this.utilService.compareNullableObjField(a.destinationLocation, b.destinationLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'destinationLocationGroup',
      showSort: true,
      sortOrder: null,
      sortFn: (a: EmergencyReplenishmentConfiguration, b: EmergencyReplenishmentConfiguration) => this.utilService.compareNullableObjField(a.destinationLocationGroup, b.destinationLocationGroup, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];


  // Select control for clients and item families
  unitOfMeasures: UnitOfMeasure[] = [];

  itemFamilies: ItemFamily[] = [];

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;

  // Table data for display
  listOfAllConfigurations: EmergencyReplenishmentConfiguration[] = [];
  listOfDisplayConfigurations: EmergencyReplenishmentConfiguration[] = [];


  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;

  constructor(
    private fb: UntypedFormBuilder,
    private emergencyReplenishmentConfigurationService: EmergencyReplenishmentConfigurationService,
    private unitOfMeasureService: UnitOfMeasureService,
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
    private utilService: UtilService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/replenishment/emergency/config").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                      
  
  }

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
