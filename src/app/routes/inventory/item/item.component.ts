import { Component, OnInit, ViewChild } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl, NgForm } from '@angular/forms';
import { Item } from '../models/item';
import { ItemService } from '../services/item.service';
import { ClientService } from '../../common/services/client.service';
import { ItemFamilyService } from '../services/item-family.service';
import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd';
import { STReq } from '@delon/abc';
import { Client } from '../../common/models/client';
import { ItemFamily } from '../models/item-family';

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
  searchForm: FormGroup;

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
  editId: string | null;
  editCol: string | null;

  searching = false;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

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
      .subscribe(itemRes => {
        this.items = itemRes;
        this.listOfDisplayItems = itemRes;

        this.filtersByName = [];
        this.filtersByClient = [];
        this.filtersByItemFamily = [];

        const existingClientId = new Set();
        const existingItemFamilyId = new Set();

        this.items.forEach(item => {
          this.filtersByName.push({ text: item.name, value: item.name });

          if (item.client && !existingClientId.has(item.client.id)) {
            this.filtersByClient.push({
              text: item.client.description,
              value: item.client.id,
            });
            existingClientId.add(item.client.id);
          }
          if (item.itemFamily && !existingItemFamilyId.has(item.itemFamily.id)) {
            this.filtersByItemFamily.push({
              text: item.itemFamily.description,
              value: item.itemFamily.id,
            });
            existingItemFamilyId.add(item.itemFamily.id);
          }
        });

        this.searching = false;
      });
  }

  currentPageDataChange($event: Item[]): void {
    this.listOfDisplayItems = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByName: string[], selectedFiltersByClient: string[], selectedFiltersItemFamily: string[]) {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByClient = selectedFiltersByClient;
    this.selectedFiltersItemFamily = selectedFiltersItemFamily;
    this.sortAndFilter();
  }

  sortAndFilter() {
    // filter data
    const filterFunc = (item: { id: number; name: string; client?: Client; itemFamily?: ItemFamily }) =>
      (this.selectedFiltersByName.length
        ? this.selectedFiltersByName.some(name => item.name.indexOf(name) !== -1)
        : true) &&
      (this.selectedFiltersByClient.length
        ? this.selectedFiltersByClient.some(id => item.client !== null && item.client.id === +id)
        : true) &&
      (this.selectedFiltersItemFamily.length
        ? this.selectedFiltersItemFamily.some(id => item.itemFamily !== null && item.itemFamily.id === +id)
        : true);
    const data = this.items.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayItems = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayItems = data;
    }
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],
      taggedItemFamilies: [null],
      itemName: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id.toString() }),
      );
    });
  }

  showItemPackageType(item: Item) {
    // When we expand to show the item package type, load the details of the item package type
  }
}
