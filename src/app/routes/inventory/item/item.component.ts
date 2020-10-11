import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STReq } from '@delon/abc';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';
import { ItemFamilyService } from '../services/item-family.service';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-inventory-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less'],
})
export class InventoryItemComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  items: Item[] = [];
  listOfDisplayItems: Item[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByName = [];
  filtersByClient = [];
  filtersByItemFamily = [];
  // Save filters that already selected
  selectedFiltersByName: string[] = [];
  selectedFiltersByClient: string[] = [];
  selectedFiltersItemFamily: string[] = [];

  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  // editable cell
  editId!: string | null;
  editCol!: string | null;

  searching = false;
  searchResult = '';

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.item'));
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],
      taggedItemFamilies: [null],
      itemName: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.itemName.setValue(params.name);
        this.search();
      }
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.items = [];
    this.listOfDisplayItems = [];
    this.filtersByName = [];
    this.filtersByClient = [];
    this.filtersByItemFamily = [];
  }
  search(): void {
    this.searching = true;
    this.itemService
      .getItems(
        this.searchForm.value.itemName,
        this.searchForm.value.taggedClients,
        this.searchForm.value.taggedItemFamilies,
      )
      .subscribe(
        itemRes => {
          this.items = itemRes;
          this.listOfDisplayItems = itemRes;

          this.filtersByName = [];
          this.filtersByClient = [];
          this.filtersByItemFamily = [];

          const existingClientId = new Set();
          const existingItemFamilyId = new Set();
 

          this.searching = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: itemRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  currentPageDataChange($event: Item[]): void {
    this.listOfDisplayItems = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByName: string[], selectedFiltersByClient: string[], selectedFiltersItemFamily: string[]): void {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByClient = selectedFiltersByClient;
    this.selectedFiltersItemFamily = selectedFiltersItemFamily;
    this.sortAndFilter();
  }

  sortAndFilter(): void {
    // filter data
     

    // sort data 
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  showItemPackageType(item: Item): void {
    // When we expand to show the item package type, load the details of the item package type
  }

  removeItem(item: Item): void {
    // make sure we have at least one checkbox checked

    this.modalService.confirm({
      nzTitle: this.i18n.fanyi('modal.delete.header.title'),
      nzContent: this.i18n.fanyi('modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkType: 'danger',
      nzOnOk: () => {
        this.itemService.removeItem(item).subscribe(res => {
          this.messageService.success(this.i18n.fanyi('message.remove.success'));
          this.search();
        });
      },
      nzCancelText: this.i18n.fanyi('cancel'),
      nzOnCancel: () => console.log('Cancel'),
    });
  }
}
