import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Inventory } from '../models/inventory';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-inventory-adjust-confirm',
  templateUrl: './inventory-adjust-confirm.component.html',
})
export class InventoryInventoryAdjustConfirmComponent implements OnInit {
  currentInventories: Inventory[];
  pageTitle: string;
  originalInventoryQuantity: Array<{ key: number; quantity: number }> = [];

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.confirm.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.adjust.confirm.title'));
    this.originalInventoryQuantity = [];
    this.currentInventories = JSON.parse(sessionStorage.getItem('inventory-adjust.inventories'));
    this.inventoryService.getInventoriesByLpn(this.currentInventories[0].lpn).subscribe(inventories => {
      inventories.forEach(inventory => {
        this.originalInventoryQuantity.push({
          key: inventory.id,
          quantity: inventory.quantity,
        });
      });
    });
  }

  getInventoryOrignalQuantity(id: number): number {
    const inventoryQuantity = this.originalInventoryQuantity.filter(item => item.key === id);
    if (inventoryQuantity.length === 1) {
      return inventoryQuantity[0].quantity;
    } else {
      return 0;
    }
  }

  confirmInventoryAdjust(inventory: Inventory) {
    this.inventoryService
      .changeInventory(inventory)
      .subscribe(res => this.router.navigateByUrl('/inventory/inventory'));
  }
}
