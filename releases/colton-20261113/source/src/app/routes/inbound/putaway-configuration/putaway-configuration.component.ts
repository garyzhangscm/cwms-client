import { formatDate } from '@angular/common';
import { Component,  inject, OnInit,  } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { ColumnItem } from '../../util/models/column-item';
import { PutawayConfiguration } from '../models/putaway-configuration';
import { PutawayConfigurationService } from '../services/putaway-configuration.service';

@Component({
    selector: 'app-inbound-putaway-configuration',
    templateUrl: './putaway-configuration.component.html',
    styleUrls: ['./putaway-configuration.component.less'],
    standalone: false
})
export class InboundPutawayConfigurationComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<PutawayConfiguration>> = [
    {
      name: 'sequence',
      sortOrder: null,
      sortFn: (a: PutawayConfiguration, b: PutawayConfiguration) => a.sequence! - b.sequence!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item',
      sortOrder: null,
      sortFn: (a: PutawayConfiguration, b: PutawayConfiguration) => a.item!.name.localeCompare(b.item!.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item-family',
      sortOrder: null,
      sortFn: (a: PutawayConfiguration, b: PutawayConfiguration) => a.itemFamily!.name.localeCompare(b.itemFamily!.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory.status',
      sortOrder: null,
      sortFn: (a: PutawayConfiguration, b: PutawayConfiguration) => a.inventoryStatus!.name.localeCompare(b.inventoryStatus!.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location',
      sortOrder: null,
      sortFn: (a: PutawayConfiguration, b: PutawayConfiguration) => a.location!.name!.localeCompare(b.location!.name!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location-group',
      sortOrder: null,
      sortFn: (a: PutawayConfiguration, b: PutawayConfiguration) => a.locationGroup!.name!.localeCompare(b.locationGroup!.name!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location-group-type',
      sortOrder: null,
      sortFn: (a: PutawayConfiguration, b: PutawayConfiguration) => a.locationGroupType!.name.localeCompare(b.locationGroupType!.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'putaway-configuration.strategy',
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  isSpinning = false; 

  // Table data for display
  listOfAllPutawayConfiguration: PutawayConfiguration[] = [];
  listOfDisplayPutawayConfiguration: PutawayConfiguration[] = [];

  listOfAllItems: Item[] = [];
  listOfDisplayItems: Item[] = [];


  availableInventoryStatuses: InventoryStatus[] = [];

  lookupDrawerVisible = false;

  lookupCriteria = '';

  searching = false;
  searchResult = '';

  
  private readonly fb = inject(FormBuilder);
  // initiate the search form
  
  
  searchForm = this.fb.nonNullable.group({
    itemName: this.fb.control('', { nonNullable: true, validators: []}),
    itemFamilyName: this.fb.control('', { nonNullable: true, validators: []}),
    inventoryStatus: this.fb.control('', { nonNullable: true, validators: []}), 
  });
  
   
  
  displayOnly = false;
  constructor( 
    private putawayConfigurationService: PutawayConfigurationService,
    private inventoryStatusService: InventoryStatusService,
    private itemService: ItemService,
    private modalService: NzModalService,
    private userService: UserService,
    private router: Router, 
  ) { 
    userService.isCurrentPageDisplayOnly("/inbound/putaway-configuration").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                  
  
  }
  ngOnInit(): void {

    // initiate the select control
    this.inventoryStatusService.loadInventoryStatuses().subscribe(inventoryStatusRes => {
      this.availableInventoryStatuses = inventoryStatusRes;
    });
  }

  resetForm(): void {
    this.searchForm!.reset();
    this.listOfAllPutawayConfiguration = [];
    this.listOfDisplayPutawayConfiguration = [];
  }
  search(): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';
    this.putawayConfigurationService
      .getPutawayConfigurations(
        undefined,
        this.searchForm!.value.itemName ? this.searchForm!.value.itemName  : undefined,
        this.searchForm!.value.itemFamilyName ? this.searchForm!.value.itemFamilyName : undefined,
        this.searchForm!.value.inventoryStatus ? this.searchForm!.value.inventoryStatus : undefined,
      )
      .subscribe(
        putawayConfigurationRes => {
          this.listOfAllPutawayConfiguration = putawayConfigurationRes;
          this.listOfDisplayPutawayConfiguration = putawayConfigurationRes;
          console.log(`putawayConfigurationRes: ${JSON.stringify(putawayConfigurationRes)}`);

          this.searching = false;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: putawayConfigurationRes.length,
          });
        },
        () => {
          this.searching = false;
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }


  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayPutawayConfiguration!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: PutawayConfiguration[]): void {
    this.listOfDisplayPutawayConfiguration! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayPutawayConfiguration!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayPutawayConfiguration!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }


  removeSelectedPutawayConfigurations(): void {
    // make sure we have at least one checkbox checked
    const selectedPutawayConfigurations = this.getSelectedPutawayConfigurations();
    if (selectedPutawayConfigurations.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('modal.delete.header.title'),
        nzContent: this.i18n.fanyi('modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.putawayConfigurationService.removePutawayConfigurations(selectedPutawayConfigurations).subscribe(res => {
            console.log('selected record removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedPutawayConfigurations(): PutawayConfiguration[] {
    const selectedPutawayConfigurations: PutawayConfiguration[] = [];
    this.listOfAllPutawayConfiguration.forEach((putawayConfiguration: PutawayConfiguration) => {
      if (this.setOfCheckedId.has(putawayConfiguration.id!)) {
        selectedPutawayConfigurations.push(putawayConfiguration);
      }
    });
    return selectedPutawayConfigurations;
  }

  openLookupDrawer(): void {
    this.lookupDrawerVisible = true;
    this.clearDrawerContent();
  }
  lookupDrawerclosed(): void {
    this.lookupDrawerVisible = false;
    this.clearDrawerContent();
  }
  clearDrawerContent(): void {
    this.listOfAllItems = [];
    this.listOfDisplayItems = [];
    this.lookupCriteria = '';
  }

  lookup(): void {
    console.log(`start to lookup ${this.lookupCriteria}`);
    this.itemService.getItems(this.lookupCriteria).subscribe(itemsRes => {
      console.log(`get item res: ${JSON.stringify(itemsRes)}`);
      this.listOfAllItems = itemsRes;
      this.listOfDisplayItems = itemsRes;
    });
  }
  currentItemPageDataChange($event: Item[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayItems = $event;
  }

  sortItem(sort: { key: string; value: string }): void {

  }
  lookupSelect(itemName: string): void {
    console.log(`user selected: ${itemName}`);

    this.lookupDrawerclosed();
    this.searchForm!.controls.itemName.setValue(itemName);
  }

  modifyPutawayConfiguration(putawayConfiguration: PutawayConfiguration) {
    this.router.navigateByUrl(
      `/inbound/putaway-configuration-maintenance?id=${putawayConfiguration.id}`);

  }
  removePutawayConfiguration(putawayConfiguration: PutawayConfiguration) {
    this.isSpinning = true;
    this.putawayConfigurationService
      .removePutawayConfiguration(putawayConfiguration)
      .subscribe({
        next: () => {
          this.isSpinning = false;
          this.search();

        }, 
        error: () =>  this.isSpinning = false
      });
    
  }
}
