import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Trailer } from '../models/trailer';
import { TrailerStatus } from '../models/trailer-status.enum';
import { TrailerService } from '../services/trailer.service';


@Component({
    selector: 'app-outbound-trailer',
    templateUrl: './trailer.component.html',
    styleUrls: ['./trailer.component.less'],
    standalone: false
})
export class OutboundTrailerComponent implements OnInit {
  listOfColumns: Array<ColumnItem<Trailer>> = [
    {
      name: 'trailer.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'trailer.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableString(a.status.toString(), b.status.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'carrier',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableObjField(a.carrier, b.carrier, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'carrier.serviceLevel',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableObjField(a.carrierServiceLevel, b.carrierServiceLevel, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'trailer.driverFirstName',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableString(a.driverFirstName, b.driverFirstName),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'trailer.driverLastName',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableString(a.driverLastName, b.driverLastName),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'trailer.licensePlateNumber',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableString(a.licensePlateNumber, b.licensePlateNumber),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'trailer.size',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableString(a.size, b.size),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'trailer.type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableString(a.type.toString(), b.type.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'trailer.location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Trailer, b: Trailer) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
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
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private trailerService: TrailerService,
    private message: NzMessageService,
    private utilService: UtilService,
  ) { }

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllTrailers: Trailer[] = [];
  listOfDisplayTrailers: Trailer[] = [];


  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllTrailers = [];
    this.listOfDisplayTrailers = [];
  }

  search(): void {
    this.trailerService.getTrailers(this.searchForm.controls.number.value).subscribe(trailerRes => {
      this.listOfAllTrailers = trailerRes;
      this.listOfDisplayTrailers = trailerRes;
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
    this.listOfDisplayTrailers!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Trailer[]): void {
    this.listOfDisplayTrailers! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayTrailers!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayTrailers!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }


  checkInTrailer(trailer: Trailer): void {
    this.trailerService.checkinTrailer(trailer, undefined).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.trailer.checkedin'));
      this.search();
    });
  }
  dispatchTrailer(trailer: Trailer): void {
    this.trailerService.dispatchTrailer(trailer).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.trailer.dispatched'));
      this.search();
    });
  }

  cancelSelectedTrailers(): void {
    // make sure we have at least one checkbox checked
    const selectedTrailers = this.getSelectedTrailers();
    if (selectedTrailers.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.trailerService.cancelTrailers(selectedTrailers).subscribe(res => {
            console.log('selected trailer cancelled');
            this.message.success(this.i18n.fanyi('message.trailer.cancelled'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedTrailers(): Trailer[] {
    const selectedShipments: Trailer[] = [];
    this.listOfAllTrailers.forEach((trailer: Trailer) => {
      if (this.setOfCheckedId.has(trailer.id)) {
        selectedShipments.push(trailer);
      }
    });
    return selectedShipments;
  }

  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });
  }
}
