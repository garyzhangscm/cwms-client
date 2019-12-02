import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Inventory } from '../models/inventory';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-inventory-adjust',
  templateUrl: './inventory-adjust.component.html',
})
export class InventoryInventoryAdjustComponent implements OnInit {
  currentInventories: Inventory[];
  pageTitle: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.header.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.adjust.header.title'));
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.inprocess === 'true') {
        this.currentInventories = JSON.parse(sessionStorage.getItem('inventory-adjust.inventories'));
      } else {
        this.inventoryService.getInventoriesByLpn(params.lpn).subscribe(inventory => {
          this.currentInventories = inventory;
        });
      }
    });
  }

  saveCurrentInventory() {
    sessionStorage.setItem('inventory-adjust.inventories', JSON.stringify(this.currentInventories));
  }
}
