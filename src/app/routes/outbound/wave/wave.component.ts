import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { WaveService } from '../services/wave.service';
import { Wave } from '../models/wave';

@Component({
  selector: 'app-outbound-wave',
  templateUrl: './wave.component.html',
  styleUrls: ['./wave.component.less'],
})
export class OutboundWaveComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private waveService: WaveService,
    private message: NzMessageService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllWaves: Wave[] = [];
  listOfDisplayWaves: Wave[] = [];
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
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllWaves = [];
    this.listOfDisplayWaves = [];
  }

  search(): void {
    this.waveService.getWaves(this.searchForm.controls.number.value).subscribe(waveRes => {
      console.log(`listOfAllWaves:\n${JSON.stringify(waveRes)}`);
      this.listOfAllWaves = this.calculateQuantities(waveRes);
      this.listOfDisplayWaves = this.calculateQuantities(waveRes);
    });
  }

  calculateQuantities(waves: Wave[]): Wave[] {
    waves.forEach(wave => {
      wave.totalOrderCount = 0;
      wave.totalItemCount = 0;
      wave.totalQuantity = 0;
      wave.totalPickedQuantity = 0;
      wave.totalStagedQuantity = 0;
      wave.totalShippedQuantity = 0;

      const existingItemIds = new Set();
      const existingOrderNumbers = new Set();

      wave.shipmentLines.forEach(shipmentLine => {
        existingItemIds.add(shipmentLine.orderLine.itemId);
        existingOrderNumbers.add(shipmentLine.orderNumber);

        wave.totalQuantity += shipmentLine.quantity;
        wave.totalShippedQuantity += shipmentLine.quantity;
      });
      wave.totalItemCount = existingItemIds.size;
      wave.totalOrderCount = existingOrderNumbers.size;
    });
    return waves;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayWaves.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayWaves.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayWaves.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayWaves = this.listOfAllWaves.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayWaves = this.listOfAllWaves;
    }
  }

  removeSelectedWaves(): void {
    // make sure we have at least one checkbox checked
    const selectedWaves = this.getSelectedWaves();
    if (selectedWaves.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.waveService.removeWaves(selectedWaves).subscribe(res => {
            console.log('selected wave removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedWaves(): Wave[] {
    const selectedWaves: Wave[] = [];
    this.listOfAllWaves.forEach((wave: Wave) => {
      if (this.mapOfCheckedId[wave.id] === true) {
        selectedWaves.push(wave);
      }
    });
    return selectedWaves;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });
  }

  allocateWave(wave: Wave) {
    this.waveService.allocateWave(wave).subscribe(waveRes => {
      this.message.success(this.i18n.fanyi('message.wave.allocated'));
      this.search();
    });
  }
}
