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
  currentInventory: Inventory;
  pageTitle: string;
  originalInventoryQuantity: number;

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
    this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-adjust.inventory'));
    this.inventoryService.getInventoryById(this.currentInventory.id).subscribe(inventory => {
      this.originalInventoryQuantity = inventory.quantity;
    });
  }

  confirmInventoryAdjust() {
    this.inventoryService
      .changeInventory(this.currentInventory)
      .subscribe(res => this.router.navigateByUrl('/inventory/inventory?refresh'));
  }
}
