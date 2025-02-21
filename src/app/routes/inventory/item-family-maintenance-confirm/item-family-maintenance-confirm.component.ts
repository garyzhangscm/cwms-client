import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { ItemFamily } from '../models/item-family';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
    selector: 'app-inventory-item-family-maintenance-confirm',
    templateUrl: './item-family-maintenance-confirm.component.html',
    standalone: false
})
export class InventoryItemFamilyMaintenanceConfirmComponent implements OnInit {
  currentItemFamily!: ItemFamily;

  pageTitle = '';

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private itemFamilyService: ItemFamilyService,
    private router: Router,
  ) {
    this.pageTitle = i18n.fanyi('page.item-family-maintenance.confirm.title');
  }

  ngOnInit(): void {
    this.currentItemFamily = JSON.parse(sessionStorage.getItem('item-family-maintenance.item-family')!);
    this.titleService.setTitle(this.i18n.fanyi('page.item-family-maintenance.confirm.title'));
  }

  saveItemFamily(): void {
    this.itemFamilyService
      .addItemFamily(this.currentItemFamily)
      .subscribe(res => this.router.navigateByUrl('/inventory/item-family'));
  }
  onStepIndexChange(event: number): void {
    this.router.navigateByUrl('/inventory/item-family-maintenance');
  }
}
