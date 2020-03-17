import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-add-inventory',
  templateUrl: './add-inventory.component.html',
  styleUrls: ['./add-inventory.component.less'],
})
export class InventoryAddInventoryComponent implements OnInit {
  pageTitle: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.addInventory.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.addInventory.title'));
  }
}
