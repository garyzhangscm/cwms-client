import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { PickWork } from '../models/pick-work';
import { PickService } from '../services/pick.service';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';

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
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private router: Router,
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

  searching = false;
  searchResult = '';

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

  search(shortAllocationId?: number): void {
    this.searching = true;
    this.searchResult = '';

    this.pickService
      .queryPicks(
        this.searchForm.controls.number.value,
        this.searchForm.controls.orderNumber.value,
        this.searchForm.controls.itemNumber.value,
        this.searchForm.controls.sourceLocation.value,
        this.searchForm.controls.destinationLocation.value,
        shortAllocationId,
      )
      .subscribe(
        pickRes => {
          this.listOfAllPicks = pickRes;
          this.listOfDisplayPicks = pickRes;

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: pickRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
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
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.pickService.cancelPicks(selectedPicks).subscribe(res => {
            this.message.success(this.i18n.fanyi('message.pick.cancelled'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  confirmSelectedPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      const selectedPickList = selectedPicks.map(pick => pick.id).join(',');
      console.log(`selectedPickList: ${selectedPickList}`);
      this.router.navigateByUrl(`/outbound/pick/confirm?type=picks&id=${selectedPickList}`);
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
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.pick'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      orderNumber: [null],
      itemNumber: [null],
      sourceLocation: [null],
      destinationLocation: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.shortAllocationId) {
        this.search(params.shortAllocationId);
      }
    });
  }
}
