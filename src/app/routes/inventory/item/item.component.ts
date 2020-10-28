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
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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
  listOfColumns: ColumnItem[] = [    
    {
          name: 'name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableString(a.name, b.name),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '120px',
        }, {
          name: 'description',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableString(a.description, b.description),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '120px',
        }, {
          name: 'client',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '120px',
        }, {
          name: 'item-family',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableObjField(a.itemFamily, b.itemFamily, 'name'),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '120px',
        }, {
          name: 'unit-cost',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableNumber(a.unitCost, b.unitCost),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '120px',
        },
        {
          name: 'allowAllocationByLPN',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.allowAllocationByLPN, b.allowAllocationByLPN),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [
            { text: this.i18n.fanyi('true'), value: true },
            { text: this.i18n.fanyi('false'), value: false },
          ],
          filterFn: (list: boolean[], item: Item) => list.some(allowAllocationByLPN => item.allowAllocationByLPN === allowAllocationByLPN), 
          showFilter: true,
          width: '150px',
        },
        {
          name: 'allocationRoundUpStrategyType',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableString(a.allocationRoundUpStrategyType?.toString(), b.allocationRoundUpStrategyType?.toString()),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '150px',
        },
        {
          name: 'allocationRoundUpStrategyValue',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableNumber(a.allocationRoundUpStrategyValue, b.allocationRoundUpStrategyValue),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '150px',
        },
        {
          name: 'trackingVolumeFlag',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingVolumeFlag, b.trackingVolumeFlag),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [
            { text: this.i18n.fanyi('true'), value: true },
            { text: this.i18n.fanyi('false'), value: false },
          ],
          filterFn: (list: boolean[], item: Item) => list.some(trackingVolumeFlag => item.trackingVolumeFlag === trackingVolumeFlag), 
          showFilter: true,
          width: '150px',
        },
        {
          name: 'trackingLotNumberFlag',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingLotNumberFlag, b.trackingLotNumberFlag),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [
            { text: this.i18n.fanyi('true'), value: true },
            { text: this.i18n.fanyi('false'), value: false },
          ],
          filterFn: (list: boolean[], item: Item) => list.some(trackingLotNumberFlag => item.trackingLotNumberFlag === trackingLotNumberFlag), 
          showFilter: true,
          width: '150px',
        },
        {
          name: 'trackingManufactureDateFlag',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingManufactureDateFlag, b.trackingManufactureDateFlag),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [
            { text: this.i18n.fanyi('true'), value: true },
            { text: this.i18n.fanyi('false'), value: false },
          ],
          filterFn: (list: boolean[], item: Item) => list.some(trackingManufactureDateFlag => item.trackingManufactureDateFlag === trackingManufactureDateFlag), 
          showFilter: true,
          width: '150px',
        }, {
          name: 'shelfLifeDays',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareNullableNumber(a.shelfLifeDays, b.shelfLifeDays),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false,
          width: '150px',
        }, 
        {
          name: 'trackingExpirationDateFlag',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingExpirationDateFlag, b.trackingExpirationDateFlag),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [
            { text: this.i18n.fanyi('true'), value: true },
            { text: this.i18n.fanyi('false'), value: false },
          ],
          filterFn: (list: boolean[], item: Item) => list.some(trackingExpirationDateFlag => item.trackingExpirationDateFlag === trackingExpirationDateFlag), 
          showFilter: true,
          width: '150px',
        }, 
        ];
  expandSet = new Set<number>();

  scrollX = '100vw';   
  
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  items: Item[] = [];
  listOfDisplayItems: Item[] = [];
  
  
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
    private utilService: UtilService,
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
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
}
