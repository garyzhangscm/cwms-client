import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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

  listOfColumns: ColumnItem[] = [    
    {
          name: 'order.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableString(a.orderNumber, b.orderNumber),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'work-order.number',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableString(a.workOrderNumber, b.workOrderNumber),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'item',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'item.description',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableObjField(a.item, b.item, 'description'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'short-allocation.quantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'short-allocation.openQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableNumber(a.openQuantity, b.openQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'short-allocation.inprocessQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableNumber(a.inprocessQuantity, b.inprocessQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'short-allocation.deliveredQuantity',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableNumber(a.deliveredQuantity, b.deliveredQuantity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'short-allocation.status',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableString(a.status, b.status),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'short-allocation.allocationCount',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareNullableNumber(a.allocationCount, b.allocationCount),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'short-allocation.lastAllocationDatetime',
          showSort: true,
          sortOrder: null,
          sortFn: (a: ShortAllocation, b: ShortAllocation) => this.utilService.compareDateTime(a.lastAllocationDatetime, b.lastAllocationDatetime),
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
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private shortAllocationService: ShortAllocationService,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {}

  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  listOfAllShortAllocations: ShortAllocation[] = [];
  listOfDisplayShortAllocations: ShortAllocation[] = [];
  

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
    this.listOfDisplayShortAllocations!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: ShortAllocation[]): void {
    this.listOfDisplayShortAllocations! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayShortAllocations!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayShortAllocations!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
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
      if (this.setOfCheckedId.has(shortAllocation.id)) {
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
