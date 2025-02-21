import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { EmergencyReplenishmentConfiguration } from '../../inventory/models/emergency-replenishment-configuration';
import { ItemFamily } from '../../inventory/models/item-family';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { AllocationConfiguration } from '../models/allocation-configuration';
import { AllocationConfigurationService } from '../services/allocation-configuration.service';

@Component({
    selector: 'app-outbound-allocation-configuration',
    templateUrl: './allocation-configuration.component.html',
    styleUrls: ['./allocation-configuration.component.less'],
    standalone: false
})
export class OutboundAllocationConfigurationComponent implements OnInit {

  listOfColumns: Array<ColumnItem<AllocationConfiguration>> = [
    {
      name: 'sequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableNumber(a.sequence, b.sequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableString(a.type, b.type),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item.item-family',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableObjField(a.itemFamily, b.itemFamily, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location-group',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableObjField(a.locationGroup, b.locationGroup, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'location-group-type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableObjField(a.locationGroupType, b.locationGroupType, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'allocation-strategy',
      showSort: true,
      sortOrder: null,
      sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableString(a.allocationStrategy, b.allocationStrategy),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'unit-of-measure',
      showSort: false,
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }
  ];

  // Select control for clients and item families

  itemFamilies: ItemFamily[] = [];

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  isSpinning = false;
  searchResult = '';
  // Table data for display
  listOfAllConfigurations: AllocationConfiguration[] = [];
  listOfDisplayConfigurations: AllocationConfiguration[] = [];


  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private allocationConfigurationService: AllocationConfigurationService,

    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
    private utilService: UtilService,
    private messageService: NzMessageService,
    private userService: UserService,
    private activatedRoute: ActivatedRoute
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/allocation-configuration").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                  
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllConfigurations = [];
    this.listOfDisplayConfigurations = [];
  }
  search(sequence?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.allocationConfigurationService.getAllocationConfigurations(
      sequence
    ).subscribe({
      next: (configurationRes) => {

        this.listOfAllConfigurations = configurationRes;
        this.listOfDisplayConfigurations = configurationRes;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: configurationRes.length,
        });
      }, 
      error: () => {
        
        this.searchResult = '';
        this.isSpinning = false;
      }
    });
  }

  currentPageDataChange($event: AllocationConfiguration[]): void {
    this.listOfDisplayConfigurations = $event;
  }


  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.allocation-configuration'));
    this.initSearchForm();

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.sequence) { 
        this.search(params.sequence);
      } 
    }); 
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      itemFamily: [null],
      itemName: [null],
    });

    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyRes: ItemFamily[]) => {
      this.itemFamilies = itemFamilyRes;
    });
  }
  removeAllocationConfiguration(allocationConfiguration: AllocationConfiguration) {
    this.isSpinning = true;
    this.allocationConfigurationService.removeAllocationConfiguration(allocationConfiguration)
    .subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false; 
          this.search();
        }, 500);
      }, 
      error: () => this.isSpinning = false
    })
  }
}
