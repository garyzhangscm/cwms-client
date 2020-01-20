import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { WaveService } from '../services/wave.service';
import { Wave } from '../models/wave';
import { PickWork } from '../models/pick-work';
import { PickService } from '../services/pick.service';

@Component({
  selector: 'app-outbound-pick',
  templateUrl: './pick.component.html',
  styleUrls: ['./pick.component.less'],
})
export class OutboundPickComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private pickService: PickService,
    private message: NzMessageService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllPicks: PickWork[] = [];
  listOfDisplayPicks: PickWork[] = [];
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

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllPicks = [];
    this.listOfDisplayPicks = [];
  }

  search(): void {
    this.pickService
      .getPicks(
        this.searchForm.controls.number.value,
        this.searchForm.controls.orderNumber.value,
        this.searchForm.controls.itemNumber.value,
        this.searchForm.controls.sourceLocation.value,
        this.searchForm.controls.destinationLocation.value,
      )
      .subscribe(pickRes => {
        this.listOfAllPicks = pickRes;
        this.listOfDisplayPicks = pickRes;
      });
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayPicks.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayPicks.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayPicks.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayPicks = this.listOfAllPicks.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayPicks = this.listOfAllPicks;
    }
  }

  cancelSelectedPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.pickService.cancelPicks(selectedPicks).subscribe(res => {
            this.message.success(this.i18n.fanyi('message.pick.cancelled'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  confirmPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      selectedPicks.forEach(pick => {
        this.pickService.confirmPick(pick).subscribe(pick => {
          this.message.success(this.i18n.fanyi('message.pick.confirmed'));
          this.search();
        })
      })
    }
  }
  getSelectedPicks(): PickWork[] {
    const selectedPicks: PickWork[] = [];
    this.listOfAllPicks.forEach((pick: PickWork) => {
      if (this.mapOfCheckedId[pick.id] === true) {
        selectedPicks.push(pick);
      }
    });
    return selectedPicks;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      orderNumber: [null],
      itemNumber: [null],
      sourceLocation: [null],
      destinationLocation: [null],
    });
  }
}
