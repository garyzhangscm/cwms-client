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
  currentInventory: Inventory;
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
        this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-attribute-change.inventory'));
      } else {
        this.inventoryService.getInventoryById(params.id).subscribe(inventory => {
          this.currentInventory = inventory;
        });
      }
    });
    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }

  saveCurrentInventory() {
    sessionStorage.setItem('inventory-attribute-change.inventory', JSON.stringify(this.currentInventory));
  }

  itemPackageTypeChange(newItemPackageTypeName) {
    const itemPackageTypes = this.currentInventory.item.itemPackageTypes.filter(
      itemPackageType => itemPackageType.name === newItemPackageTypeName,
    );
    if (itemPackageTypes.length === 1) {
      this.currentInventory.itemPackageType = itemPackageTypes[0];
    }
  }
  inventoryStatusChange(newInventoryStatusName) {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        this.currentInventory.inventoryStatus = inventoryStatus;
      }
    });
  }
}
