import { formatDate } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';
import { ItemFamilyService } from '../services/item-family.service';
import { ItemService } from '../services/item.service';

@Component({
    selector: 'app-inventory-item-query-popup',
    templateUrl: './item-query-popup.component.html',
    styleUrls: ['./item-query-popup.component.less'],
    standalone: false
})
export class InventoryItemQueryPopupComponent implements OnInit {
  scrollX = '100vw';

  listOfColumns: Array<ColumnItem<Item>> = [
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


  itemFamilies: Array<{ label: string; value: string }> = [];
  availableClients: Client[] = [];

  // Form related data and functions
  queryModal!: NzModalRef;
  searchForm!: UntypedFormGroup;

  searching = false;
  queryInProcess = false;
  searchResult = '';


  // Table data for display
  listOfAllItems: Item[] = [];
  listOfDisplayItems: Item[] = [];

  // list of checked checkbox
  setOfCheckedId = new Set<number>();
  threePartyLogisticsFlag = false;


  @Input() clientId? : number = undefined;
  // eslint-disable-next-line @angular-eslint/prefer-output-readonly
  @Output() recordSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder,
    private itemService: ItemService,
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private warehouseConfigurationService: WarehouseConfigurationService,
    private utilService: UtilService,
    private clientService: ClientService,
  ) {
    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe(
      {
        next: (configRes) => {
          if (configRes != null) {
            this.threePartyLogisticsFlag = configRes.threePartyLogisticsFlag;
          }
          else {

            this.threePartyLogisticsFlag = false;
          }
        }
      }
    )
   }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
 
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllItems = [];
    this.listOfDisplayItems = [];
  }

  search(): void {
    this.searching = true;
    this.itemService
      .getItems(
        this.searchForm.value.itemName,
        undefined,
        this.searchForm.value.taggedItemFamilies,
        undefined, undefined, 
        this.searchForm.value.clientId
      )
      .subscribe(
        itemRes => {
          this.listOfAllItems = itemRes;
          this.listOfDisplayItems = itemRes;
          this.setOfCheckedId.clear();

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


  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.clear();
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  currentPageDataChange(listOfDisplayItems: Item[]): void {
    this.listOfDisplayItems = listOfDisplayItems;
  }


  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }


  isAnyRecordChecked(): boolean {
    return this.listOfDisplayItems.some(item => this.setOfCheckedId.has(item.id!));
  }

  openQueryModal(
    tplQueryModalTitle: TemplateRef<{}>,
    tplQueryModalContent: TemplateRef<{}>,
    tplQueryModalFooter: TemplateRef<{}>,
  ): void {

    this.listOfAllItems = [];
    this.listOfDisplayItems = [];

    
    this.clientService.getClients().subscribe({
      next: (clientRes) => {
        this.availableClients = clientRes;
        this.setupQueryModal(tplQueryModalTitle, tplQueryModalContent, tplQueryModalFooter);
      }, 
      error: () =>  this.setupQueryModal(tplQueryModalTitle, tplQueryModalContent, tplQueryModalFooter)
       
    });

  }

  setupQueryModal(
    tplQueryModalTitle: TemplateRef<{}>,
    tplQueryModalContent: TemplateRef<{}>,
    tplQueryModalFooter: TemplateRef<{}>,) {

      this.createQueryForm();

      // show the model
      this.queryModal = this.modalService.create({
        nzTitle: tplQueryModalTitle,
        nzContent: tplQueryModalContent,
        nzFooter: tplQueryModalFooter,
  
        nzWidth: 1000,
      });
  }
  createQueryForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      clientId: new UntypedFormControl({ value: this.clientId, disabled: false }),
      taggedItemFamilies: [null],
      itemName: [null],
    });

    console.log(`this.clientId： ${this.clientId}`)
    console.log(`this.threePartyLogisticsFlag ${this.threePartyLogisticsFlag}`)

    // initiate the select control
    this.itemFamilies = [];
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }
  closeQueryModal(): void {
    this.queryModal.destroy();
  }
  returnResult(): void {
    // get the selected record
    if (this.isAnyRecordChecked()) {
      this.recordSelected.emit(
        this.listOfDisplayItems.filter(item => (this.setOfCheckedId.has(item.id!)))[0].name,
      );
    } else {
      this.recordSelected.emit('');
    }
    this.queryModal.destroy();

  }
  rowClicked(item: Item): void {
    // WHen the user click the row, if 
    // toggle the check box for this row
    if (this.setOfCheckedId.has(item.id!)) {
      this.updateCheckedSet(item.id!, false);
    }
    else {
      this.updateCheckedSet(item.id!, true);
    }
  }

}
