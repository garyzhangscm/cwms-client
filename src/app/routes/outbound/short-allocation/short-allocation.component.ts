import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PickWork } from '../models/pick-work';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { PickService } from '../services/pick.service';
import { ShortAllocationService } from '../services/short-allocation.service';

@Component({
  selector: 'app-outbound-short-allocation',
  templateUrl: './short-allocation.component.html',
  styleUrls: ['./short-allocation.component.less'],
})
export class OutboundShortAllocationComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private shortAllocationService: ShortAllocationService,
    private messageService: NzMessageService,
  ) {}

  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  listOfAllShortAllocations: ShortAllocation[] = [];
  listOfDisplayShortAllocations: ShortAllocation[] = [];
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

  shortAllocationStatus = ShortAllocationStatus;

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllShortAllocations = [];
    this.listOfDisplayShortAllocations = [];
  }

  search(): void {
    this.shortAllocationService
      .getShortAllocations(this.searchForm.controls.orderNumber.value, this.searchForm.controls.itemNumber.value)
      .subscribe(shortAllocationRes => {
        this.listOfAllShortAllocations = shortAllocationRes;
        this.listOfDisplayShortAllocations = shortAllocationRes;
      });
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayShortAllocations.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayShortAllocations.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayShortAllocations.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data 
  }

  cancelSelectedShortAllocations(): void {
    // make sure we have at least one checkbox checked
    const selectedShortAllocations = this.getSelectedShortAllocations();
    if (selectedShortAllocations.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.shortAllocationService.cancelShortAllocations(selectedShortAllocations).subscribe(res => {
            this.messageService.success(this.i18n.fanyi('message.short-allocation.cancelled'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedShortAllocations(): ShortAllocation[] {
    const selectedShortAllocations: ShortAllocation[] = [];
    this.listOfAllShortAllocations.forEach((shortAllocation: ShortAllocation) => {
      if (this.mapOfCheckedId[shortAllocation.id] === true) {
        selectedShortAllocations.push(shortAllocation);
      }
    });
    return selectedShortAllocations;
  }

  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      orderNumber: [null],
      itemNumber: [null],
    });
  }

  cancelShortAllocation(shortAllocation: ShortAllocation): void {
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the short allocation
      this.search();
    });
  }

  isShortAllocationAllocatable(shortAllocation: ShortAllocation): boolean {
    return shortAllocation.openQuantity > 0;
  }

  allocateShortAllocation(shortAllocation: ShortAllocation): void {
    this.shortAllocationService.allocateShortAllocation(shortAllocation).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
}
