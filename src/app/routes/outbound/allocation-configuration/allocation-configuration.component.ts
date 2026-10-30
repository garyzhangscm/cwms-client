import { finalize, map, timeout } from 'rxjs';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';

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

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly modeHttp = inject(_HttpClient);
  private readonly modeWarehouse = inject(WarehouseService);
  allocationMode: 'ITEM_QUANTITY' | 'CLASSIC' = 'ITEM_QUANTITY';
  savedAllocationMode: 'ITEM_QUANTITY' | 'CLASSIC' | null = null;
  modeRevision = 0;
  modeLoading = false;
  modeSaving = false;
  modeError = '';
  private modeWarehouseId?: number;

  private unwrapAllocationMode(response: any): any {
    if (!response || response.result !== 0 || !response.data) {
      throw new Error('Allocation mode response could not be verified');
    }
    return response.data;
  }

  loadAllocationMode(): void {
    if (this.modeLoading || this.modeSaving) return;
    this.modeLoading = true;
    this.modeError = '';
    this.savedAllocationMode = null;
    const warehouseId = this.modeWarehouse.getCurrentWarehouse().id;
    this.modeWarehouseId = warehouseId;
    this.modeHttp.get('outbound/outbound-configuration/allocation-mode', { warehouseId })
      .pipe(timeout(15000), map(response => this.unwrapAllocationMode(response)), finalize(() => this.modeLoading = false))
      .subscribe({
        next: (result: any) => {
          if (this.modeWarehouse.getCurrentWarehouse().id !== warehouseId) { this.modeError = 'Warehouse changed. Reload the allocation mode.'; return; }
          if (!result || !['ITEM_QUANTITY', 'CLASSIC'].includes(result.mode) || !Number.isSafeInteger(result.revision)) {
            this.modeError = 'The allocation mode could not be verified. Reload before saving.'; return;
          }
          this.allocationMode = this.savedAllocationMode = result.mode;
          this.modeRevision = result.revision;
        },
        error: () => this.modeError = 'Allocation mode settings are unavailable. Administrator access and the updated backend are required. Existing allocation rules remain available.'
      });
  }

  saveAllocationMode(): void {
    if (this.modeLoading || this.modeSaving || this.savedAllocationMode === null || this.displayOnly || this.allocationMode === this.savedAllocationMode) return;
    if (this.modeWarehouse.getCurrentWarehouse().id !== this.modeWarehouseId) { this.savedAllocationMode = null; this.modeError = 'Warehouse changed. Reload before saving.'; return; }
    const warehouseId = this.modeWarehouseId;
    this.modeSaving = true;
    this.modeError = '';
    this.modeHttp.put('outbound/outbound-configuration/allocation-mode?warehouseId=' + warehouseId,
      { mode: this.allocationMode, revision: this.modeRevision })
      .pipe(timeout(15000), map(response => this.unwrapAllocationMode(response)), finalize(() => this.modeSaving = false))
      .subscribe({
        next: (result: any) => {
          if (this.modeWarehouse.getCurrentWarehouse().id !== warehouseId || !result || !['ITEM_QUANTITY', 'CLASSIC'].includes(result.mode) || !Number.isSafeInteger(result.revision)) {
            this.savedAllocationMode = null; this.modeError = 'Reload to verify the saved allocation mode.'; return;
          }
          this.allocationMode = this.savedAllocationMode = result.mode;
          this.modeRevision = result.revision;
          this.messageService.success('Allocation mode saved. Existing orders keep their selected mode.');
        },
        error: () => { this.savedAllocationMode = null; this.modeError = 'The save could not be confirmed. Reload to check the current mode before trying again.'; }
      });
  }

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
    this.loadAllocationMode();
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.allocation-configuration'));
    this.initSearchForm();

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['sequence']) { 
        this.search(params['sequence']);
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
