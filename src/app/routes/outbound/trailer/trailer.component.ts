import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Trailer } from '../models/trailer';
import { TrailerStatus } from '../models/trailer-status.enum';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { TrailerService } from '../services/trailer.service';
import { Shipment } from '../models/shipment';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-outbound-trailer',
  templateUrl: './trailer.component.html',
  styleUrls: ['./trailer.component.less'],
})
export class OutboundTrailerComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private trailerService: TrailerService,
    private message: NzMessageService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllTrailers: Trailer[] = [];
  listOfDisplayTrailers: Trailer[] = [];
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
    this.listOfAllTrailers = [];
    this.listOfDisplayTrailers = [];
  }

  search(): void {
    this.trailerService.getTrailers(this.searchForm.controls.number.value).subscribe(trailerRes => {
      this.listOfAllTrailers = trailerRes;
      this.listOfDisplayTrailers = trailerRes;
    });
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayTrailers.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayTrailers.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayTrailers.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayTrailers = this.listOfAllTrailers.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayTrailers = this.listOfAllTrailers;
    }
  }
  checkInTrailer(trailer: Trailer) {
    this.trailerService.checkinTrailer(trailer, null).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.trailer.checkedin'));
      this.search();
    });
  }
  dispatchTrailer(trailer: Trailer) {
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
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.trailerService.cancelTrailers(selectedTrailers).subscribe(res => {
            console.log('selected trailer cancelled');
            this.message.success(this.i18n.fanyi('message.trailer.cancelled'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedTrailers(): Trailer[] {
    const selectedShipments: Trailer[] = [];
    this.listOfAllTrailers.forEach((trailer: Trailer) => {
      if (this.mapOfCheckedId[trailer.id] === true) {
        selectedShipments.push(trailer);
      }
    });
    return selectedShipments;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });
  }
}
