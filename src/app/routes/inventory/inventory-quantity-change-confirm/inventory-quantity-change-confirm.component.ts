import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Inventory } from '../models/inventory';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-inventory-quantity-change-confirm',
  templateUrl: './inventory-quantity-change-confirm.component.html',
})
export class InventoryInventoryQuantityChangeConfirmComponent implements OnInit {
  currentInventory: Inventory;
  pageTitle: string;
  originalInventoryQuantity: number;
  previousApplication: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.confirm.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.adjust.confirm.title'));
    this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-quantity-change.inventory'));
    this.inventoryService.getInventoryById(this.currentInventory.id).subscribe(inventory => {
      this.originalInventoryQuantity = inventory.quantity;
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.previousApplication = params.by;
    });
  }

  confirmInventoryAdjust() {
    this.inventoryService.adjustInventoryQuantity(this.currentInventory).subscribe(res => {
      if (this.previousApplication === 'inventory') {
        this.router.navigateByUrl(`/inventory/inventory?id=${res.id}&refresh=true`);
      } else {
        this.router.navigateByUrl(`/inventory/inventory-adjust?locationName=${res.location.name}&expand=true`);
      }
    });
  }
}
