import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ItemFamily } from '../../inventory/models/item-family';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AllocationConfiguration } from '../models/allocation-configuration';
import { EmergencyReplenishmentConfigurationService } from '../../inventory/services/emergency-replenishment-configuration.service';
import { UnitOfMeasureService } from '../../common/services/unit-of-measure.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd';
import { EmergencyReplenishmentConfiguration } from '../../inventory/models/emergency-replenishment-configuration';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
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
  searchForm: FormGroup;

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
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.allocation-configuration'));
    this.initSearchForm();
  }

  initSearchForm() {
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
