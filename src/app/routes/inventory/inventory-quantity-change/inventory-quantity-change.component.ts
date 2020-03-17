import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Inventory } from '../models/inventory';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-inventory-quantity-change',
  templateUrl: './inventory-quantity-change.component.html',
})
export class InventoryInventoryQuantityChangeComponent implements OnInit {
  currentInventory: Inventory = {
    id: null,
    lpn: '',
    location: null,
    item: null,
    itemPackageType: null,
    quantity: 0,
    inventoryStatus: null,
  };
  pageTitle: string;
  // track whether we comes from inventory or inventory adjust
  // so we can return back to the right page after the quantity adjust is done
  previousApplication: string;
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
        this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-quantity-change.inventory'));
      } else {
        this.inventoryService.getInventoryById(params.id).subscribe(inventory => {
          this.currentInventory = inventory;
        });
      }
      this.previousApplication = params.by;
    });
  }

  saveCurrentInventory() {
    sessionStorage.setItem('inventory-quantity-change.inventory', JSON.stringify(this.currentInventory));
  }
}
