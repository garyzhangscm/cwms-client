import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { PutawayConfiguration } from '../models/putaway-configuration';
import { PutawayConfigurationService } from '../services/putaway-configuration.service';

@Component({
  selector: 'app-inbound-putaway-configuration',
  templateUrl: './putaway-configuration.component.html',
  styleUrls: ['./putaway-configuration.component.less'],
})
export class InboundPutawayConfigurationComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup | undefined;

  // Table data for display
  listOfAllPutawayConfiguration: PutawayConfiguration[] = [];
  listOfDisplayPutawayConfiguration: PutawayConfiguration[] = [];

  listOfAllItems: Item[] = [];
  listOfDisplayItems: Item[] = [];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  availableInventoryStatuses: InventoryStatus[] = [];

  lookupDrawerVisible = false;

  lookupCriteria = '';

  searching = false;
  searchResult = '';

  constructor(
    private fb: FormBuilder,
    private putawayConfigurationService: PutawayConfigurationService,
    private inventoryStatusService: InventoryStatusService,
    private itemService: ItemService,
    private modalService: NzModalService,
    private i18n: I18NService,
  ) {}
  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      itemName: [null],
      itemFamilyName: [null],
      inventoryStatus: [null],
    });

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
    this.searchResult = '';
    this.putawayConfigurationService
      .getPutawayConfigurations(
        undefined,
        this.searchForm!.controls.itemName.value,
        this.searchForm!.controls.itemFamilyName.value,
        this.searchForm!.controls.inventoryStatus.value,
      )
      .subscribe(
        putawayConfigurationRes => {
          this.listOfAllPutawayConfiguration = putawayConfigurationRes;
          this.listOfDisplayPutawayConfiguration = putawayConfigurationRes;
          console.log(`putawayConfigurationRes: ${JSON.stringify(putawayConfigurationRes)}`);

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: putawayConfigurationRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  currentPageDataChange($event: PutawayConfiguration[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayPutawayConfiguration = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayPutawayConfiguration.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayPutawayConfiguration.some(item => this.mapOfCheckedId[item.id]) &&
      !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayPutawayConfiguration.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  sortAndFilter(): void {
    const data = this.listOfAllPutawayConfiguration;

    // sort data
    
  }

  removeSelectedPutawayConfigurations(): void {
    // make sure we have at least one checkbox checked
    const selectedPutawayConfigurations = this.getSelectedPutawayConfigurations();
    if (selectedPutawayConfigurations.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.putaway-configuration.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.putaway-configuration.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
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
      if (this.mapOfCheckedId[putawayConfiguration.id] === true) {
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
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    
  }
  lookupSelect(itemName: string): void {
    console.log(`user selected: ${itemName}`);

    this.lookupDrawerclosed();
    this.searchForm!.controls.itemName.setValue(itemName);
  }
}
