import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { EmergencyReplenishmentConfiguration } from '../../inventory/models/emergency-replenishment-configuration';
import { ItemFamily } from '../../inventory/models/item-family';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { AllocationConfiguration } from '../models/allocation-configuration';
import { AllocationConfigurationService } from '../services/allocation-configuration.service';

@Component({
  selector: 'app-outbound-allocation-configuration',
  templateUrl: './allocation-configuration.component.html',
  styleUrls: ['./allocation-configuration.component.less'],
})
export class OutboundAllocationConfigurationComponent implements OnInit {
  // Select control for clients and item families

  itemFamilies: ItemFamily[] = [];

  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;

  // Table data for display
  listOfAllConfigurations: AllocationConfiguration[] = [];
  listOfDisplayConfigurations: AllocationConfiguration[] = [];
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
    private allocationConfigurationService: AllocationConfigurationService,

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
    this.allocationConfigurationService.getAllocationConfiguration().subscribe(configurationRes => {
      this.listOfAllConfigurations = configurationRes;
      this.listOfDisplayConfigurations = configurationRes;
      this.searching = false;
    });
  }

  currentPageDataChange($event: AllocationConfiguration[]): void {
    this.listOfDisplayConfigurations = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
 
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
