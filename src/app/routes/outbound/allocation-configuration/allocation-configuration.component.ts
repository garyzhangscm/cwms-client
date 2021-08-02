import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
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
})
export class OutboundAllocationConfigurationComponent implements OnInit {

  listOfColumns: ColumnItem[] = [    
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
          sortFn: (a: AllocationConfiguration, b: AllocationConfiguration) => this.utilService.compareNullableString(a.type.toString(), b.type.toString()),
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
  searchForm!: FormGroup;

  searching = false;

  // Table data for display
  listOfAllConfigurations: AllocationConfiguration[] = [];
  listOfDisplayConfigurations: AllocationConfiguration[] = [];
  

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private allocationConfigurationService: AllocationConfigurationService,

    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private titleService: TitleService,
    private utilService: UtilService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllConfigurations = [];
    this.listOfDisplayConfigurations = [];
  }
  search(): void {
    this.searching = true;
    this.allocationConfigurationService.getAllocationConfiguration().subscribe(configurationRes => {
      this.listOfAllConfigurations = configurationRes;
      this.listOfDisplayConfigurations = configurationRes;
      this.searching = false;
    });
  }

  currentPageDataChange($event: AllocationConfiguration[]): void {
    this.listOfDisplayConfigurations = $event;
  }
  

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.allocation-configuration'));
    this.initSearchForm();
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
}
