import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Inventory } from '../models/inventory';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { InventoryService } from '../services/inventory.service';
import { InventoryStatus } from '../models/inventory-status';
import { InventoryStatusService } from '../services/inventory-status.service';

@Component({
  selector: 'app-inventory-inventory-attribute-change',
  templateUrl: './inventory-attribute-change.component.html',
})
export class InventoryInventoryAttributeChangeComponent implements OnInit {
  currentInventories: Inventory[];
  pageTitle: string;
  availableInventoryStatuses: InventoryStatus[];
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private inventoryStatusService: InventoryStatusService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.attributeChange.header.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.attributeChange.header.title'));
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.inprocess === 'true') {
        this.currentInventories = JSON.parse(sessionStorage.getItem('inventory-attribute-change.inventories'));
      } else {
        this.inventoryService.getInventoriesByLpn(params.lpn).subscribe(inventories => {
          this.currentInventories = inventories;
          console.log('inventories:\n' + JSON.stringify(inventories));
        });
      }
    });
    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }

  saveCurrentInventory() {
    sessionStorage.setItem('inventory-attribute-change.inventories', JSON.stringify(this.currentInventories));
  }

  itemPackageTypeChange(inventory: Inventory, newItemPackageTypeCode) {
    console.log('before item package type change:\n' + JSON.stringify(inventory));

    const itemPackageTypes = inventory.item.itemPackageTypes.filter(
      itemPackageType => itemPackageType.code === newItemPackageTypeCode,
    );
    if (itemPackageTypes.length === 1) {
      console.log(`reset item package type from inventory.itemPackageType.code to itemPackageTypes[0].code`);
      inventory.itemPackageType = itemPackageTypes[0];
    }
    console.log('after item package type change:\n' + JSON.stringify(inventory));
  }
}
