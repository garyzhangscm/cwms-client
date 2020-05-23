import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShippingCartonizationService } from '../services/shipping-cartonization.service';
import { NzMessageService } from 'ng-zorro-antd';
import { I18NService } from '@core';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Carton } from '../models/carton';
import { CartonService } from '../services/carton.service';

interface PackingItem {
  itemName: string;
  quantity: number;
  packedQuantity: number;
  progress: number;
}

@Component({
  selector: 'app-outbound-shipping-cartonization',
  templateUrl: './shipping-cartonization.component.html',
  styles: [
    `
      tr.active {
        background-color: green;
      }
    `,
  ],
})
export class OutboundShippingCartonizationComponent implements OnInit {
  shippingCartonizationQueryForm: FormGroup;
  avaiableShippingCartons: Carton[];
  listOfPackingItems: PackingItem[];
  lastConfirmedItemName: string;
  totalProgress: number;
  workInProgress = false;
  @ViewChild('inventoryIdTextBox', { static: true }) inventoryIdTextBox: ElementRef;
  @ViewChild('itemNameTextBox', { static: true }) itemNameTextBox: ElementRef;

  constructor(
    private fb: FormBuilder,
    private shippingCartonizationService: ShippingCartonizationService,
    private messageService: NzMessageService,
    private i18n: I18NService,
    private inventoryService: InventoryService,
    private cartonService: CartonService,
  ) {}

  ngOnInit() {
    this.lastConfirmedItemName = '';
    this.totalProgress = 0;
    this.workInProgress = false;
    this.shippingCartonizationQueryForm = this.fb.group({
      inventoryId: [null],
      cartonName: [null],
      itemName: [null],
    });

    this.cartonService
      .getAllShippingCarton()
      .subscribe(shippingCartonRes => (this.avaiableShippingCartons = shippingCartonRes));
  }

  onUserInputInventoryIdEnter() {
    this.itemNameTextBox.nativeElement.focus();
  }
  onUserInputInventoryIdBlur() {
    if (this.shippingCartonizationQueryForm.controls.inventoryId.value) {
      this.workInProgress = true;
      this.displayPackingItem(this.shippingCartonizationQueryForm.controls.inventoryId.value);

      this.totalProgress = 0;
    }
  }

  displayPackingItem(inventoryId: string) {
    this.listOfPackingItems = [];
    // For now we will always assume the id is a LPN
    // TO-DO: We may add support for list id / order / etc later no
    this.inventoryService.getInventoriesByLpn(inventoryId).subscribe(inventoryRes => {
      inventoryRes.forEach(inventory => {
        const itemName = inventory.item.name;
        const quantity = inventory.quantity;
        let existingPackingItemIndex = -1;

        this.listOfPackingItems.forEach((packingItem, index) => {
          if (packingItem.itemName === itemName) {
            existingPackingItemIndex = index;
          }
        });
        // console.log(`item ${itemName} exists? :  ${existingPackingItemIndex}`);
        if (existingPackingItemIndex >= 0) {
          this.listOfPackingItems[existingPackingItemIndex].quantity += inventory.quantity;
        } else {
          console.log(`push ${itemName}, ${quantity}`);
          this.listOfPackingItems = [
            ...this.listOfPackingItems,
            {
              itemName,
              quantity,
              packedQuantity: 0,
              progress: 0,
            },
          ];
        }
      });

      this.workInProgress = false;
    });
  }

  onUserInputItemNameEvent() {}
  resetForm() {
    this.workInProgress = false;
    this.shippingCartonizationQueryForm.reset();
    this.listOfPackingItems = [];
    this.inventoryIdTextBox.nativeElement.focus();
  }
  confirm() {
    this.workInProgress = true;
    // Confirm will automatically set the packed quantity for each item to be
    // same as the expected quantity
    this.listOfPackingItems.forEach(packingItem => {
      packingItem.packedQuantity = packingItem.quantity;
      packingItem.progress = 100;
    });
    this.resetTotalProgress();

    this.workInProgress = false;
  }
  resetTotalProgress() {
    let totalQuantity = 0;
    let totalPackedQuantity = 0;
    this.listOfPackingItems.forEach(packingItem => {
      totalQuantity += packingItem.quantity;
      totalPackedQuantity += packingItem.packedQuantity;
    });
    this.totalProgress = (totalQuantity * 100) / totalPackedQuantity;
  }
  complete() {
    this.resetTotalProgress();
    if (this.totalProgress === 0) {
      // We haven't done anything yet, we should not arrive here
      this.messageService.error(this.i18n.fanyi('message.action.fail'));
    } else if (this.totalProgress === 100) {
      this.workInProgress = true;
      // OK we have move everything into the shipping carton, let's pack it
      this.shippingCartonizationService
        .pack(
          this.shippingCartonizationQueryForm.controls.inventoryId.value,
          this.listOfPackingItems,
          this.shippingCartonizationQueryForm.controls.cartonName.value,
        )
        .subscribe(
          packResult => {
            console.log(`Packed: \n ${JSON.stringify(packResult)}`);
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.workInProgress = false;
            this.resetForm();
          },
          err => {
            console.log(`Pack fail due to error: \n ${JSON.stringify(err)}`);
            this.messageService.error(this.i18n.fanyi('message.action.fail'));
            this.workInProgress = false;
          },
        );
    }
  }
}
