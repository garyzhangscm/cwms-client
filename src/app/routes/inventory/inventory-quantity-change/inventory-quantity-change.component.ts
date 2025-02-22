import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { Inventory } from '../models/inventory';
import { InventoryService } from '../services/inventory.service';

@Component({
    selector: 'app-inventory-inventory-quantity-change',
    templateUrl: './inventory-quantity-change.component.html',
    standalone: false
})
export class InventoryInventoryQuantityChangeComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentInventory: Inventory = {
    id: undefined,
    lpn: '',
    location: undefined,
    item: undefined,
    itemPackageType: undefined,
    quantity: 0,
    inventoryStatus: undefined,
  };
  isSpinning = false;
  pageTitle: string;
  // track whether we comes from inventory or inventory adjust
  // so we can return back to the right page after the quantity adjust is done
  previousApplication = '';
  constructor(
    private activatedRoute: ActivatedRoute, 
        private titleService: TitleService,
    private inventoryService: InventoryService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.header.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.adjust.header.title'));
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['inprocess'] === 'true') {
        this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-quantity-change.inventory')!);
      } else {
        this.inventoryService.getInventoryById(params['id']).subscribe(inventory => {
          this.currentInventory = inventory;
        });
      }
      this.previousApplication = params['by'];
    });
  }

  saveCurrentInventory(): void {
    sessionStorage.setItem('inventory-quantity-change.inventory', JSON.stringify(this.currentInventory));
  }
}
