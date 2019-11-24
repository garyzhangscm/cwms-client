import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ItemFamily } from '../models/item-family';
import { Router } from '@angular/router';
import { I18NService } from '@core';

@Component({
  selector: 'app-inventory-item-family-maintenance',
  templateUrl: './item-family-maintenance.component.html',
})
export class InventoryItemFamilyMaintenanceComponent implements OnInit {
  currentItemFamily: ItemFamily;
  pageTitle: string;

  emptyItemFamily: ItemFamily = {
    id: 0,
    name: '',
    description: '',
    totalItemCount: 0,
  };

  constructor(private router: Router, private i18n: I18NService, private titleService: TitleService) {}

  ngOnInit() {
    this.loadItemFamilyFromSessionStorage();
    this.setupPageTitle();
  }

  loadItemFamilyFromSessionStorage() {
    this.currentItemFamily =
      sessionStorage.getItem('item-family-maintenance.item-family') === null
        ? this.emptyItemFamily
        : JSON.parse(sessionStorage.getItem('item-family-maintenance.item-family'));
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.item-family-maintenance.add.title'));
    this.pageTitle = this.i18n.fanyi('page.item-family-maintenance.add.title');
  }
  goToConfirmPage(): void {
    sessionStorage.setItem('item-family-maintenance.item-family', JSON.stringify(this.currentItemFamily));
    const url = '/inventory/item-family-maintenance/confirm';
    this.router.navigateByUrl(url);
  }
}
