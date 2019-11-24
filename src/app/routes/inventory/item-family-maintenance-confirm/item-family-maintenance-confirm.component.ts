import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ItemFamily } from '../models/item-family';
import { I18NService } from '@core';
import { ItemFamilyService } from '../services/item-family.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-item-family-maintenance-confirm',
  templateUrl: './item-family-maintenance-confirm.component.html',
})
export class InventoryItemFamilyMaintenanceConfirmComponent implements OnInit {
  currentItemFamily: ItemFamily;

  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private itemFamilyService: ItemFamilyService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.item-family-maintenance.confirm.title');
  }

  ngOnInit() {
    this.currentItemFamily = JSON.parse(sessionStorage.getItem('item-family-maintenance.item-family'));
    this.titleService.setTitle(this.i18n.fanyi('page.item-family-maintenance.confirm.title'));
  }

  saveItemFamily() {
    this.itemFamilyService
      .addItemFamily(this.currentItemFamily)
      .subscribe(res => this.router.navigateByUrl('/inventory/item-family'));
  }
  onStepIndexChange(event: number) {
    this.router.navigateByUrl('/inventory/item-family-maintenance');
  }
}
