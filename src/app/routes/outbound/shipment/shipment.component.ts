import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order';
import { Customer } from '../../common/models/customer';
import { ShipmentService } from '../services/shipment.service';
import { Shipment } from '../models/shipment';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-outbound-shipment',
  templateUrl: './shipment.component.html',
  styleUrls: ['./shipment.component.less'],
})
export class OutboundShipmentComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private shipmentService: ShipmentService,
    private message: NzMessageService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllShipments: Shipment[] = [];
  listOfDisplayShipments: Shipment[] = [];
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
    this.listOfAllShipments = [];
    this.listOfDisplayShipments = [];
  }

  search(): void {
    this.shipmentService.getShipments(this.searchForm.controls.number.value).subscribe(shipmentRes => {
      this.listOfAllShipments = shipmentRes;
      this.listOfDisplayShipments = shipmentRes;
    });
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayShipments.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayShipments.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayShipments.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayShipments = this.listOfAllShipments.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayShipments = this.listOfAllShipments;
    }
  }

  cancelSelectedShipments(): void {
    // make sure we have at least one checkbox checked
    const selectedShipments = this.getSelectedShipments();
    if (selectedShipments.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.shipmentService.cancelShipments(selectedShipments).subscribe(res => {
            console.log('selected shipment cancelled');
            this.message.success(this.i18n.fanyi('message.shipment.cancelled'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedShipments(): Shipment[] {
    const selectedShipments: Shipment[] = [];
    this.listOfAllShipments.forEach((shipment: Shipment) => {
      if (this.mapOfCheckedId[shipment.id] === true) {
        selectedShipments.push(shipment);
      }
    });
    return selectedShipments;
  }

  completeShipment(shipment: Shipment) {
    this.shipmentService.completeShipment(shipment).subscribe(res => {
      console.log('shipment complete');
      this.message.success(this.i18n.fanyi('message.shipment.complete'));
      this.search();
    });
  }
  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });
  }
}
