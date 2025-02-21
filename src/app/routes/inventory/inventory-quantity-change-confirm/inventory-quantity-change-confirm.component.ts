import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Inventory } from '../models/inventory';
import { InventoryService } from '../services/inventory.service';

@Component({
    selector: 'app-inventory-inventory-quantity-change-confirm',
    templateUrl: './inventory-quantity-change-confirm.component.html',
    standalone: false
})
export class InventoryInventoryQuantityChangeConfirmComponent implements OnInit {
  currentInventory!: Inventory;
  pageTitle = '';
  originalInventoryQuantity = 0;
  previousApplication = '';
  documentNumber = '';
  comment = '';
  isSpinning = false;
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.adjust.confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.adjust.confirm.title'));
    this.currentInventory = JSON.parse(sessionStorage.getItem('inventory-quantity-change.inventory')!);
    this.inventoryService.getInventoryById(this.currentInventory.id!).subscribe(inventory => {
      this.originalInventoryQuantity = inventory.quantity!;
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.previousApplication = params.by;
    });
  }

  confirmInventoryAdjust(): void {
    this.isSpinning = true;
    this.inventoryService
      .adjustInventoryQuantity(this.currentInventory, this.documentNumber, this.comment)
      .subscribe(inventoryRes => {
        if (inventoryRes.lockedForAdjust === true) {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.request-success'));
        } else {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
        }
        setTimeout(() => {
          if (this.previousApplication === 'inventory') {
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/inventory?id=${inventoryRes.id}&refresh=true`);
          } else {
            this.isSpinning = false;
            this.router.navigateByUrl(
              `/inventory/inventory-adjust?locationName=${inventoryRes.location!.name}&expand=true`,
            );
          }
        }, 500);
      }, 
      () => this.isSpinning = false);
  }
}
