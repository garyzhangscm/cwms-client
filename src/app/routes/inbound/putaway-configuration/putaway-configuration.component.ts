import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { PutawayConfiguration } from '../models/putaway-configuration';
import { FormGroup, FormBuilder } from '@angular/forms';
import { PutawayConfigurationService } from '../services/putaway-configuration.service';
import { NzModalService } from 'ng-zorro-antd';
import { I18NService } from '@core';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';

@Component({
  selector: 'app-inbound-putaway-configuration',
  templateUrl: './putaway-configuration.component.html',
  styleUrls: ['./putaway-configuration.component.less'],
})
export class InboundPutawayConfigurationComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllPutawayConfiguration: PutawayConfiguration[] = [];
  listOfDisplayPutawayConfiguration: PutawayConfiguration[] = [];
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

  availableInventoryStatuses: InventoryStatus[];

  constructor(
    private fb: FormBuilder,
    private putawayConfigurationService: PutawayConfigurationService,
    private inventoryStatusService: InventoryStatusService,
    private modalService: NzModalService,
    private i18n: I18NService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllPutawayConfiguration = [];
    this.listOfDisplayPutawayConfiguration = [];
  }
  search(): void {
    this.putawayConfigurationService
      .getPutawayConfigurations(
        null,
        this.searchForm.controls.itemName.value,
        this.searchForm.controls.itemFamilyName.value,
        this.searchForm.controls.inventoryStatus.value,
      )
      .subscribe(putawayConfigurationRes => {
        this.listOfAllPutawayConfiguration = putawayConfigurationRes;
        this.listOfDisplayPutawayConfiguration = putawayConfigurationRes;
        console.log(`putawayConfigurationRes: ${JSON.stringify(putawayConfigurationRes)}`);
      });
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

  sortAndFilter() {
    const data = this.listOfAllPutawayConfiguration;

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayPutawayConfiguration = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayPutawayConfiguration = data;
    }
  }

  removeSelectedPutawayConfigurations(): void {
    // make sure we have at least one checkbox checked
    const selectedPutawayConfigurations = this.getSelectedPutawayConfigurations();
    if (selectedPutawayConfigurations.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.putaway-configuration.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.putaway-configuration.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.putawayConfigurationService.removePutawayConfigurations(selectedPutawayConfigurations).subscribe(res => {
            console.log('selected record removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
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

  ngOnInit() {
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
}
