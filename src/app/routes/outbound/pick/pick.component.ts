import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { PickWork } from '../models/pick-work';
import { PickService } from '../services/pick.service';

@Component({
  selector: 'app-outbound-pick',
  templateUrl: './pick.component.html',
  styleUrls: ['./pick.component.less'],
})
export class OutboundPickComponent implements OnInit {

  listOfColumns: ColumnItem[] = [
    {
      name: 'pick.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableNumber(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'pick.type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.pickType, b.pickType),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableString(a.orderNumber, b.orderNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'sourceLocation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.sourceLocation, b.sourceLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'destinationLocation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.destinationLocation, b.destinationLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableObjField(a.item, b.item, 'description'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'pick.quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'pick.pickedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: PickWork, b: PickWork) => this.utilService.compareNullableNumber(a.pickedQuantity, b.pickedQuantity),
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
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private pickService: PickService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private router: Router,
    private utilService: UtilService,
  ) { }

  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  listOfAllPicks: PickWork[] = [];
  listOfDisplayPicks: PickWork[] = [];

  searching = false;
  searchResult = '';



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
    this.listOfDisplayPicks!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: PickWork[]): void {
    this.listOfDisplayPicks! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayPicks!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayPicks!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }



  cancelSelectedPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
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
      if (this.setOfCheckedId.has(pick.id)) {
        selectedPicks.push(pick);
      }
    });
    return selectedPicks;
  }

  ngOnInit(): void {
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
