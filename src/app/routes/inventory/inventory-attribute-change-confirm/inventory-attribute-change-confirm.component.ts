import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Inventory } from '../models/inventory';
import { InventoryStatus } from '../models/inventory-status';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { InventoryService } from '../services/inventory.service';
import { InventoryStatusService } from '../services/inventory-status.service';

@Component({
  selector: 'app-inventory-inventory-attribute-change-confirm',
  templateUrl: './inventory-attribute-change-confirm.component.html',
})
export class InventoryInventoryAttributeChangeConfirmComponent implements OnInit {
  currentInventory: Inventory;
  pageTitle: string;

  originalInventoryItemPackageTypeName: string;
  originalInventoryStatusName: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.attributeChange.confirm.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.attributeChange.confirm.title'));
    this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-attribute-change.inventory'));

    // Assume we will process one LPN at a time
    this.inventoryService.getInventoryById(this.currentInventory.id).subscribe(inventory => {
      this.originalInventoryItemPackageTypeName = inventory.itemPackageType.name;
      this.originalInventoryStatusName = inventory.inventoryStatus.name;
    });
  }

  saveCurrentInventory() {
    if (
      this.currentInventory.inventoryStatus.name !== this.originalInventoryStatusName ||
      this.currentInventory.itemPackageType.name !== this.originalInventoryItemPackageTypeName
    ) {
      this.inventoryService
        .changeInventory(this.currentInventory)
        .subscribe(res => this.router.navigateByUrl('/inventory/inventory?refresh'));
    }
  }
}
