import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl , UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { CustomerReturnOrder } from '../models/customer-return-order';
import { CustomerReturnOrderLine } from '../models/customer-return-order-line';
import { CustomerReturnOrderLineService } from '../services/customer-return-order-line.service';
import { CustomerReturnOrderService } from '../services/customer-return-order.service';

@Component({
    selector: 'app-inbound-customer-return-receive',
    templateUrl: './customer-return-receive.component.html',
    standalone: false
})
export class InboundCustomerReturnReceiveComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  currentCustomerReturnOrder?: CustomerReturnOrder;
  pageTitle: string;
  isSpinning = false;

  receivingForm!: UntypedFormGroup;
  availableInventoryStatuses: InventoryStatus[] = [];
  receivingItem?: Item;

  constructor(private http: _HttpClient, 
    private activatedRoute: ActivatedRoute, 
    private customerReturnOrderService: CustomerReturnOrderService,
    private customerReturnOrderLineService: CustomerReturnOrderLineService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private locationService: LocationService,
    private messageService: NzMessageService, 
    private inventoryStatusService: InventoryStatusService) {
      this.pageTitle = this.i18n.fanyi('customer-return-order-receiving'); }

  ngOnInit(): void { 
    
    this.receivingForm = this.fb.group({
      itemNumber:  [''] ,
      lpn:   ['', Validators.required],
      inventoryStatus: ['', Validators.required],
      itemPackageType: ['', Validators.required],
      quantity: ['', Validators.required],
      locationName: ['']
    }),

    this.receivingItem = undefined;
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) { 
        this.customerReturnOrderService.getCustomerReturnOrder(params['id'])
          .subscribe(customerReturnOrderRes => {
            this.currentCustomerReturnOrder = customerReturnOrderRes;  
          });
        
      }
    });

    this.loadAvailableInventoryStatus();
  }

  loadAvailableInventoryStatus() {
    
    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }
  
  get lpnControl(): AbstractControl | null {
    return this.receivingForm.get('lpn');
  }

  receivingLPNChanged(event: Event): void {
    this.receivingForm!.value.lpn.setValue((event.target as HTMLInputElement).value);
  }
  itemChanged(csrLine: CustomerReturnOrderLine) { 
    this.receivingItem = csrLine?.item;
    console.log(`item is chagned to ${csrLine.item?.name}`)
  } 
  receivingInventory(): void {
    this.isSpinning = true;
    if (this.receivingForm.valid) {
      // check if the location name is input. If so, we receive into that location
      // otherwise, we receive into the reciept location
      const locationName =
        this.receivingForm.value.locationName === ''
          ? this.currentCustomerReturnOrder!.number
          : this.receivingForm.value.locationName;

      let csrLine: CustomerReturnOrderLine | undefined = this.getMatchedCSROrderLine(this.currentCustomerReturnOrder!, this.receivingItem!);

      if (csrLine == null) {
        this.messageService.error(`can't find customer return order line with item ${this.receivingItem?.name}`);
        return;
      }
      this.locationService.getLocations(undefined, undefined, locationName).subscribe(locations => {
        this.customerReturnOrderLineService
          .receiveInventory(
            this.currentCustomerReturnOrder!.id!,
            csrLine!.id!,
            this.createReceivingInventory(csrLine!, locations[0]),
          )
          .subscribe(
            () => {
              this.messageService.success(this.i18n.fanyi('message.receiving.success'));
  
              this.isSpinning = false;
 
            },
            () => { 
              this.isSpinning = false;
            },
          );
      });
    } else {
      this.displayReceivingFormError(this.receivingForm); 
      this.isSpinning = false;
    }
  }

  getMatchedCSROrderLine(customerReturnOrder: CustomerReturnOrder, item: Item): CustomerReturnOrderLine | undefined {
    return customerReturnOrder.customerReturnOrderLines.find(
      csrLine => csrLine.itemId === item.id!
    );
  }
  displayReceivingFormError(fromGroup: UntypedFormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }

  createReceivingInventory(csrLine: CustomerReturnOrderLine, receiptLocation: WarehouseLocation): Inventory {
    const inventoryStatus = this.availableInventoryStatuses
      .filter(
        availableInventoryStatus => availableInventoryStatus.id === this.receivingForm.value.inventoryStatus,
      )
      .pop();
    const itemPackageType = this.receivingItem!.itemPackageTypes
      .filter(
        existingItemPackageType => existingItemPackageType.id === this.receivingForm.value.itemPackageType,
      )
      .pop();

    return {
      id: undefined,
      lpn: this.receivingForm.value.lpn,
      location: receiptLocation,
      locationName: receiptLocation.name,
      item: this.receivingItem,
      itemPackageType,
      quantity: this.receivingForm.value.quantity,
      inventoryStatus,
    };
  }
}
