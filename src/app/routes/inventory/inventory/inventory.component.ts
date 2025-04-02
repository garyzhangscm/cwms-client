import { formatDate } from '@angular/common'; 
import { Component,  inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
// import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
// import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STData, STModule, STChange } from '@delon/abc/st';
import { XlsxService } from '@delon/abc/xlsx';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { ClientService } from '../../common/services/client.service';
import { PrintingService } from '../../common/services/printing.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum'; 
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { Inventory } from '../models/inventory';
import { InventoryConfiguration } from '../models/inventory-configuration';
import { InventoryDisplayOption } from '../models/inventory-display-option.enum';
import { InventoryMovement } from '../models/inventory-movement';
import { InventoryStatus } from '../models/inventory-status';
import { ItemFamily } from '../models/item-family';
import { ItemUnitOfMeasure } from '../models/item-unit-of-measure';
import { InventoryConfigurationService } from '../services/inventory-configuration.service';
import { InventoryStatusService } from '../services/inventory-status.service';
import { InventoryService } from '../services/inventory.service';
import { ItemFamilyService } from '../services/item-family.service';   
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-inventory-inventory',
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.less'],
    standalone: false
})
export class InventoryInventoryComponent implements OnInit { 
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  inventoryTablePI = 10;
  inventoryTablePS = 1;

  @ViewChild('inventoryTable', { static: false })
  inventoryTable!: STComponent;
  invetoryTablePagination = {
    showSize: true,
    pageSizes: [5, 10, 25, 50, 100],
    front: false,
  };
  inventoryConfiguration?: InventoryConfiguration;

  inventoryTableRecordPerPages: number[] = [5, 10, 25, 50, 100]

  inventoryTablecolumns: STColumn[] = [];
  
  customColumns: { label: string, value: string; checked: boolean; }[] = [];

  

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.inventoryTable !== undefined && this.inventoryTable.columns !== undefined) {
        this.inventoryTable!.resetColumns({ emitReload: true });

    }
  }

  // Select control for clients and item families 
  availableClients: Client[] = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  // Form related data and functions 
  inventoryMovementForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  inventories: Inventory[] = [];
  listOfDisplayInventories: Inventory[] = [];
  locationGroups: LocationGroup[] = [];


  inventoryToBeRemoved!: Inventory;
  inventoryRemovalModal!: NzModalRef;

  documentNumber = '';
  comment = '';

  isCollapse = false;
  isSpinning = false;
  validInventoryStatuses: InventoryStatus[] = [];

  inventoryMoveModal!: NzModalRef;

  mapOfInprocessInventoryId: { [key: string]: boolean } = {};

  // whether we are move inventory in a batch
  batchMovement = false;
  inventoryDisplayOptions = InventoryDisplayOption;
  inventoryDisplayOptionsKeys = Object.keys(this.inventoryDisplayOptions);
  inventoryDisplayOption?: InventoryDisplayOption;
  
  loadingDetailsRequest = 0;
  threePartyLogisticsFlag = false;


/** 
 * 
 * 
  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
*/

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['adjust-inventory-quantity', false],
    ['change-inventory-attribute', false],
    ['move-inventory', false],
    ['remove-inventory', false],
    ['remove-inventory-in-batch', false],
    ['move-inventory-in-batch', false],
    ['upload-inventory', false],
    ['reverse-inventory', false],
  ]);
  
  private readonly fb = inject(FormBuilder);
  
  searchForm = this.fb.nonNullable.group({
    client: this.fb.control<Client | undefined>(undefined, []),
    locationGroups: this.fb.control<number | undefined>(undefined, []),
    taggedItemFamilies: this.fb.control<ItemFamily[] | undefined>(undefined, []),
    itemName: this.fb.control('', []),
    location: this.fb.control('', []),
    lpn: this.fb.control<string | undefined>(undefined, []),
    inventoryStatus: this.fb.control<number | undefined>(undefined, []),
    color: this.fb.control('', []),
    style: this.fb.control('', []),
    receiptNumber: this.fb.control<string | undefined>(undefined, []),
  });
 
  
   
  
  constructor( 
    private inventoryService: InventoryService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService, 
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private locationService: LocationService,
    private locationGroupService: LocationGroupService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private datePipe: DatePipe,
    private printingService: PrintingService,
    private router: Router,
    private localCacheService: LocalCacheService,
    private userService: UserService,
    private inventoryStatusService: InventoryStatusService,
    private workOrderService: WorkOrderService,
    private xlsx: XlsxService,
    private inventoryConfigurationService: InventoryConfigurationService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/inventory").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );      
    userService.getUserPermissionByWebPage("/inventory/inventory").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    }); 
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        } 
        this.setupInventoryTableColumns();
      } , 
      error: () =>  this.setupInventoryTableColumns()
    });

    /**
     * 
     * 
    this.inventoryService.graphqlGetInventoryById(37537).subscribe({
      next: (inventoryRes) => {
         console.log(`get inventory by graphql: \n ${JSON.stringify(inventoryRes)}`);
      }
    })
     */
    
  }
  setupInventoryTableColumns() {
    this.inventoryTablecolumns = [
      { title: '', index: 'number', type: 'checkbox' },
      { title: this.i18n.fanyi("client"),  index: 'client.name' ,  width: 100,
          sort: {
            compare: (a, b) => a.client.name.localeCompare(b.client.name)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.client.name ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('client')  && this.threePartyLogisticsFlag }, 
      { title: this.i18n.fanyi("lpn"),  index: 'lpn' , width: 150,
          sort: {
            compare: (a, b) => a.lpn.localeCompare(b.lpn)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.lpn ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('lpn')  }, 
      { title: this.i18n.fanyi("item"),  render: 'itemColumn',width: 150,
            sort: {
              compare: (a, b) => a.item.name.localeCompare(b.item.name)
            },
            filter: {
              menus:  [] ,
              fn: (filter, record) => record.item.name ===  filter.value,
              multiple: true
            },
          iif: () => this.isChoose('item')  }, 
      { title: this.i18n.fanyi("item.package-type"),  render: 'itemPackageTypeColumn',
          iif: () => this.isChoose('itemPackageType')  }, 
      { title: this.i18n.fanyi("location"),  render: 'locationColumn' ,
          sort: {
            compare: (a, b) => a.location.name.localeCompare(b.location.name)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.location.name ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('location')  }, 
      { title: this.i18n.fanyi("quantity"),  render: 'quantityColumn' , 
          sort: {
            compare: (a, b) => a.quantity - b.quantity
          },
          index: 'quantity',
          iif: () => this.isChoose('quantity') , statistical: 'sum', key: 'quantitySum'}, 
      { title: this.i18n.fanyi("inventory.status"),  render: 'inventoryStatusColumn' ,
            sort: {
              compare: (a, b) => a.inventoryStatus.name.localeCompare(b.inventoryStatus.name)
            },
            filter: {
              menus:  [] ,
              fn: (filter, record) => record.inventoryStatus.name ===  filter.value,
              multiple: true
            },
          iif: () => this.isChoose('inventoryStatus')  }, 
      { title: this.i18n.fanyi("fifoDate"),  render: 'fifoDateColumn' ,
          sort: {
            compare: (a, b) => a.fifoDate.localeCompare(b.fifoDate)
          },
          iif: () => this.isChoose('fifoDate')  }, 
      { title: this.i18n.fanyi("inWarehouseDatetime"),  render: 'inWarehouseDatetimeColumn' ,
          sort: {
            compare: (a, b) => a.inWarehouseDatetime.localeCompare(b.inWarehouseDatetime)
          },
          iif: () => this.isChoose('inWarehouseDatetime') , width: 200 }, 
          
      { title: this.i18n.fanyi("receipt"),  render: 'receiptColumn' ,
      sort: {
        compare: (a, b) => a.receipt.name.localeCompare(b.receipt.name)
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.receipt.name ===  filter.value,
        multiple: true
      },
      iif: () => this.isChoose('receipt')  }, 

      { title: this.i18n.fanyi("color"),  index: 'color' ,
          sort: {
            compare: (a, b) => a.color.localeCompare(b.color)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.color ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('color')  }, 
      { title: this.i18n.fanyi("productSize"),  index: 'productSize' ,
          sort: {
            compare: (a, b) => a.productSize.localeCompare(b.productSize)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.productSize ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('productSize')  }, 
      { title: this.i18n.fanyi("style"),  index: 'style' ,
          sort: {
            compare: (a, b) => a.style.localeCompare(b.style)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.style ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('style')  },  
      { title: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
            this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,  
            index: 'attribute1' ,
            sort: {
              compare: (a, b) => a.attribute1.localeCompare(b.attribute1)
            },
            filter: {
              menus:  [] ,
              fn: (filter, record) => record.attribute1 ===  filter.value,
              multiple: true
            },
          iif: () => this.isChoose('attribute1') && this.inventoryConfiguration?.inventoryAttribute1Enabled == true,  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
               this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,    
               index: 'attribute2' ,
               sort: {
                 compare: (a, b) => a.attribute2.localeCompare(b.attribute2)
               },
               filter: {
                 menus:  [] ,
                 fn: (filter, record) => record.attribute2 ===  filter.value,
                 multiple: true
               },
          iif: () => this.isChoose('attribute2') && this.inventoryConfiguration?.inventoryAttribute2Enabled == true,  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,    
          index: 'attribute3' ,
          sort: {
            compare: (a, b) => a.attribute3.localeCompare(b.attribute3)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.attribute3 ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('attribute3') && this.inventoryConfiguration?.inventoryAttribute3Enabled == true,  }, 
      { title: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,  
          index: 'attribute4' ,
          sort: {
            compare: (a, b) => a.attribute4.localeCompare(b.attribute4)
          },
          filter: {
            menus:  [] ,
            fn: (filter, record) => record.attribute4 ===  filter.value,
            multiple: true
          },
          iif: () => this.isChoose('attribute4') && this.inventoryConfiguration?.inventoryAttribute4Enabled == true,  },
      { title: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,  
              index: 'attribute5' ,
              sort: {
                compare: (a, b) => a.attribute5.localeCompare(b.attribute5)
              },
              filter: {
                menus:  [] ,
                fn: (filter, record) => record.attribute5 ===  filter.value,
                multiple: true
              },
          iif: () => this.isChoose('attribute5') && this.inventoryConfiguration?.inventoryAttribute5Enabled == true,  },
      { title: this.i18n.fanyi("inventory.locked-for-adjustment"),  render: 'lockedForAdjustColumn' ,
          iif: () => this.isChoose('lockedForAdjust')  }, 
      { title: this.i18n.fanyi("inventory.pick-id"),  render: 'pickColumn' ,
          iif: () => this.isChoose('pick')  },   
      { title: this.i18n.fanyi("inventory.allocated-by-pick-id"),  render: 'allocateByPickColumn' ,
          iif: () => this.isChoose('allocateByPick')  },   
      { title: this.i18n.fanyi("movement-path"),  render: 'movementPathColumn' ,
          iif: () => this.isChoose('movementPath')  },   
      { title: this.i18n.fanyi("action"),  render: 'actionColumn' , 
        iif: () => (!this.displayOnly) && (this.inventoryDisplayOption == null || this.inventoryDisplayOption == InventoryDisplayOption.NONE),
        width: 350,
        fixed: 'right',},  
    ]; 
    
    this.customColumns = [
  
      { label: this.i18n.fanyi("client"), value: 'client', checked: true },
      { label: this.i18n.fanyi("lpn"), value: 'lpn', checked: true },
      { label: this.i18n.fanyi("item"), value: 'item', checked: true },
      { label: this.i18n.fanyi("item.package-type"), value: 'itemPackageType', checked: true },
      { label: this.i18n.fanyi("location"), value: 'location', checked: true },
      { label: this.i18n.fanyi("quantity"), value: 'quantity', checked: true },
      { label: this.i18n.fanyi("inventory.status"), value: 'inventoryStatus', checked: true },
      { label: this.i18n.fanyi("fifoDate"), value: 'fifoDate', checked: true }, 
      { label: this.i18n.fanyi("inWarehouseDatetime"), value: 'inWarehouseDatetime', checked: true }, 
      { label: this.i18n.fanyi("receipt"), value: 'receipt', checked: true }, 
      { label: this.i18n.fanyi("color"), value: 'color', checked: true }, 
      { label: this.i18n.fanyi("productSize"), value: 'productSize', checked: true }, 
      { label: this.i18n.fanyi("style"), value: 'style', checked: true }, 
      { label: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
            this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,
         value: 'attribute1', checked: true }, 
      { label: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
          this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,
          value: 'attribute2', checked: true }, 
      { label: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
          this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,
          value: 'attribute3', checked: true }, 
      { label: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
            this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,
            value: 'attribute4', checked: true }, 
      { label: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
          this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,
          value: 'attribute5', checked: true }, 
      { label: this.i18n.fanyi("inventory.locked-for-adjustment"), value: 'lockedForAdjust', checked: true }, 
      { label: this.i18n.fanyi("inventory.pick-id"), value: 'pick', checked: true }, 
      { label: this.i18n.fanyi("inventory.allocated-by-pick-id"), value: 'allocateByPick', checked: true }, 
      { label: this.i18n.fanyi("movement-path"), value: 'movementPath', checked: true }, 
    ];
  }
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.inventory'));
    this.initSearchForm();
     

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('refresh')) {
        if (params['id']) {
          this.search(params['id']);
        } else if (params['lpn']) {
          this.searchForm.controls.lpn.setValue(params['lpn']);
          this.search();
        } else if (params['location']) {
          this.searchForm.controls.location.setValue(params['location']);
          this.search();
        } else {
          this.search();
        }
      }
    });
    
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });
    
    this.inventoryStatusService
    .loadInventoryStatuses()
    .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses)); 

    this.initClientAssignment();
  }
   

  initClientAssignment(): void {
    
    this.isSpinning = true;
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
    
  }
   

  resetForm(): void {
    this.searchForm.reset();
    this.inventories = [];
    this.listOfDisplayInventories = [];


  }
  search(id?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
    
    // this.setOfCheckedId.clear();
    if (id) {
      this.inventoryService.getInventoryById(id).subscribe(
        inventoryRes => { 
          this.processInventoryQueryResult([inventoryRes]);
          
          // this.resetInventoryTableColumnsFilter();
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: 1,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
    } else {
      
      this.inventoryService
        .getPageableInventories(
          this.searchForm.value.client ? this.searchForm.value.client : undefined,
          this.searchForm.value.taggedItemFamilies ? this.searchForm.value.taggedItemFamilies : undefined,
          this.searchForm.value.itemName ? this.searchForm.value.itemName : undefined,
          this.searchForm.value.location ? this.searchForm.value.location : undefined,
          this.searchForm.value.lpn ? this.searchForm.value.lpn : undefined,
          false,
          this.searchForm.value.inventoryStatus ? this.searchForm.value.inventoryStatus : undefined,
          this.searchForm.value.locationGroups ? this.searchForm.value.locationGroups : undefined,
          this.searchForm.value.color ? this.searchForm.value.color : undefined,
          this.searchForm.value.style ? this.searchForm.value.style : undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined, 
          this.searchForm.value.receiptNumber ? this.searchForm.value.receiptNumber : undefined,
          this.inventoryTable.pi,
          this.inventoryTable.ps
        )
        .subscribe({
          next: (page) => {
            this.inventoryTable.total = page.totalElements;
            

            this.processInventoryQueryResult(page.content);
            // this.resetInventoryTableColumnsFilter();
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: page.totalElements,
            });
          },
          error: () => {

            this.isSpinning = false;
            this.searchResult = '';
          }
        });
        
    }
  }
  resetInventoryTableColumnsFilter(){
      this.resetInventoryTableClientColumnsFilter(); 
      this.inventoryTable.resetColumns();

  }
  
  resetInventoryTableClientColumnsFilter() { 
    
    if (this.inventoryTable.columns?.length && this.inventoryTable.columns?.length > 1 && this.inventoryTable.columns[1].filter != null) {
      console.log(this.inventoryTable.columns[1])
      this.inventoryTable.columns[1].filter.menus =[];
      let clientNames = new Set(this.listOfDisplayInventories.map(inventory => inventory.client?.name));

      this.listOfDisplayInventories.forEach(
        inventory => console.log(`inventory ${inventory.lpn} :\n${JSON.stringify(inventory)}`)
      )
      console.log(`get client name from the list of inventory: \n${JSON.stringify(clientNames)}`);

      clientNames.forEach(
        clientName => {
          this.inventoryTable.columns![1]!.filter!.menus = [...this.inventoryTable.columns![1]!.filter!.menus!, {

            text: clientName,
            value: clientName,
          }]
        }
      ) 
    }
  }

  processInventoryQueryResult(inventories: Inventory[]): void {
    this.inventories = inventories;
    this.setupDisplay(inventories); 

    this.loadDetails(this.listOfDisplayInventories);

  }
  setupDisplay(inventories: Inventory[]): void {
    if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_LPN) {

      this.setupDisplayGroupByLpn(inventories);
    }
    else if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_ITEM) {

      this.setupDisplayGroupByItem(inventories);
    }
    else if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_LOCATION) {

      this.setupDisplayGroupByLocation(inventories);
    }
    else if (this.inventoryDisplayOption == InventoryDisplayOption.GROUP_BY_LOCATION_ITEM) {

      this.setupDisplayGroupByLocationAndItem(inventories);
    }
    else {
      // by default display the result directly
      this.listOfDisplayInventories = inventories
    }
 
  }
  
  setupDisplayGroupByLpn(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: lpn
    // value: Inventory result
    let inventoryMap : Map<String, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: String = inventory.lpn!;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }
  
  setupDisplayGroupByItem(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: item id
    // value: Inventory result
    let inventoryMap : Map<number, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: number = inventory.item!.id!;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }
  setupDisplayGroupByLocation(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: location id
    // value: Inventory result
    let inventoryMap : Map<number, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: number = inventory.locationId!;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }
  setupDisplayGroupByLocationAndItem(inventories: Inventory[]) {
    this.listOfDisplayInventories = [];
    // key: location id - Item id
    // value: Inventory result
    let inventoryMap : Map<String, Inventory> = new Map();
    inventories.forEach(
      inventory => {
          let key: String = `${inventory.locationId!}-${inventory.item?.id}`;
          if (inventoryMap.get(key)) {
            // the value already exists, let's setup the value
            // 1. sum up the quantity
            // 2. for other attribute, if the new inventory has
            //    different value from the previous inventory, then
            //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
            inventoryMap.set(key, 
              this.sumUpInventory(inventoryMap.get(key)!, inventory))

          }
          else {
            // initial the inventory
            inventoryMap.set(key, inventory);
          }
      }
    )
    inventoryMap.forEach((inventory, key) => 
      this.listOfDisplayInventories = [...this.listOfDisplayInventories, 
          inventory]);

  }

  // the value already exists, let's setup the value
  // 1. sum up the quantity
  // 2. for other attribute, if the new inventory has
  //    different value from the previous inventory, then
  //    show empty(for object) or 'MULTIPLE-VALUE'(for string)
  sumUpInventory(existingInventory: Inventory, newInventory: Inventory) : Inventory {
    let sumInventory : Inventory = { 
      lpn: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
      client: existingInventory.clientId == newInventory.clientId ? existingInventory.client : undefined,
      clientId: existingInventory.clientId == newInventory.clientId ? existingInventory.clientId : undefined,
      locationId: existingInventory.locationId == newInventory.locationId ? existingInventory.locationId : undefined,
      location: existingInventory.locationId == newInventory.locationId ? existingInventory.location : undefined,
      locationName: existingInventory.locationId == newInventory.locationId ? existingInventory.locationName : "** Multiple Values**",
      item: existingInventory.item?.id == newInventory.item?.id ? existingInventory.item : undefined,
      virtual: existingInventory.virtual == newInventory.virtual ? existingInventory.virtual : undefined,
      warehouseId: existingInventory.warehouseId == newInventory.warehouseId ? existingInventory.warehouseId : undefined,
      warehouse: existingInventory.warehouseId == newInventory.warehouseId ? existingInventory.warehouse : undefined,
      itemPackageType: existingInventory.itemPackageType?.id == newInventory.itemPackageType?.id ? existingInventory.itemPackageType : undefined,
      quantity: existingInventory.quantity! + newInventory.quantity!,
      displayQuantity: (existingInventory.displayQuantity ? 0 : existingInventory.displayQuantity!) 
              +  (newInventory.displayQuantity ? 0 : newInventory.displayQuantity!),
      inventoryStatus: existingInventory.inventoryStatus?.id == newInventory.inventoryStatus?.id ? existingInventory.inventoryStatus : undefined, 
      lockedForAdjust: existingInventory.lockedForAdjust == newInventory.lockedForAdjust ? existingInventory.lockedForAdjust : undefined,
    
      pickId: existingInventory.pickId == newInventory.pickId ? existingInventory.pickId : undefined,
      pick: existingInventory.pickId == newInventory.pickId ? existingInventory.pick : undefined,
      allocatedByPickId: existingInventory.allocatedByPickId == newInventory.allocatedByPickId ? existingInventory.allocatedByPickId : undefined,
      allocatedByPick: existingInventory.allocatedByPickId == newInventory.allocatedByPickId ? existingInventory.allocatedByPick : undefined,
    
      inventoryMovements: [],
      receiptId: existingInventory.receiptId == newInventory.receiptId ? existingInventory.receiptId : undefined,
      receiptLineId: existingInventory.receiptLineId == newInventory.receiptLineId ? existingInventory.receiptLineId : undefined,
      inboundQCRequired: existingInventory.inboundQCRequired == newInventory.inboundQCRequired ? existingInventory.inboundQCRequired : undefined,
    
      fifoDate: existingInventory.fifoDate == newInventory.fifoDate ? existingInventory.fifoDate : undefined,
      
      color: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
      productSize: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
      style: existingInventory.lpn == newInventory.lpn ? existingInventory.lpn : "** Multiple Values**",
    }

    // console.log(`existingInventory ${existingInventory.lpn}'s quantity: ${existingInventory.quantity}`);
    // console.log(`newInventory ${newInventory.lpn}'s quantity: ${newInventory.quantity}`);
    // console.log(`sumInventory ${sumInventory.lpn}'s quantity: ${sumInventory.quantity}`);

    return sumInventory;
  }
  
  // we will load the information 
  // asyncronized
  async loadDetails(inventories: Inventory[]) {
 
    let index = 0;
    this.loadingDetailsRequest = 0;

    
    while (index < inventories.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 inventory at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many inventory into the server at a time 
      
      
      while(this.loadingDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      await this.loadDetail(inventories[index]);
      index++;
    } 
    while(this.loadingDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
 
    
    this.inventoryTable.reload();
    // this.inventoryTable.reset();  
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  async loadDetail(inventory: Inventory) {
 

    await this.loadLocation(inventory);

    await this.loadReceipt(inventory);

    this.loadClients(inventory);

    this.loadInventoryMovements(inventory);

    // load the Unit of Measure for each item unit of measure of each package type
    this.loadUnitOfMeasure(inventory);

    // calculate the display quantity based on the display UOM
    this.calculateDisplayQuantity(inventory);

    await this.loadPicksInformation(inventory);
    
    await this.loadAllocateByPicksInformation(inventory);

    await this.loadStockUnitOfMeasure(inventory);

    await this.loadDisplayUnitOfMeasure(inventory);

    
  }

  calculateDisplayQuantity(inventory: Inventory) : void {
    // see if we have the display UOM setup
    // console.log(`start to setup display quantity for inventory of lpn ${inventory.lpn}`)
    if (inventory.itemPackageType?.displayItemUnitOfMeasure) {
      // console.log(`inventory.itemPackageType \n ${JSON.stringify(inventory.itemPackageType)}`);
      let displayItemUnitOfMeasureQuantity  = inventory.itemPackageType.displayItemUnitOfMeasure.quantity;

      if (inventory.quantity! % displayItemUnitOfMeasureQuantity! ==0) {
        inventory.displayQuantity = inventory.quantity! / displayItemUnitOfMeasureQuantity!
      }
      else {
        // the inventory's quantity can't be devided by the display uom, we will display the quantity in 
        // stock uom
        inventory.displayQuantity = inventory.quantity;
        inventory.itemPackageType.displayItemUnitOfMeasure = inventory.itemPackageType.stockItemUnitOfMeasure;
      }
    }
    else {
      // there's no display UOM setup for this inventory, we will display
      // by the quantity
      inventory.displayQuantity = inventory.quantity; 
    }
  }
  
  async loadLocation(inventory: Inventory) {
 
    /***
     * 
    if (inventory.locationId && inventory.location == null) {
      this.loadingDetailsRequest++;
      this.localCacheService.getLocation(inventory.locationId!).subscribe(
        {
          next: (locationRes) => {
            inventory.location = locationRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     */
    // load the information for current location
    if (inventory.locationId && inventory.location == null) {
      this.loadingDetailsRequest++;
      inventory.location =  await this.localCacheService.getLocation(inventory.locationId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
       
    } 

  }
  
  async loadReceipt(inventory: Inventory) {
    // load the information for current location
    if (inventory.receiptId && inventory.receipt == null) {
        
      
      this.loadingDetailsRequest++;
      
      let receipt =  await this.localCacheService.getReceipt(inventory.receiptId!).toPromise()
      .catch(reason => console.log(reason)).finally(
        () =>  this.loadingDetailsRequest-- 
      );
      if (receipt != null) {
        inventory.receipt = receipt;
      }
       
    } 

  }
   
  async loadClients(inventory: Inventory) {
    if (inventory.clientId && inventory.client == null) {
      this.loadingDetailsRequest++;
      inventory.client =  await this.localCacheService.getClient(inventory.clientId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 

  }

  async loadInventoryMovements(inventory: Inventory) {
 
    // load the location of the inventory movement
    if (inventory.inventoryMovements && inventory.inventoryMovements.length > 0) {
      inventory.inventoryMovements.forEach(
        inventoryMovement => this.loadInventoryMovementDetails(inventoryMovement)
      )
    }

  }
  async loadInventoryMovementDetails(inventoryMovement: InventoryMovement) {

    /**
     * 
    if (inventoryMovement.locationId && inventoryMovement.location == null) {

      this.loadingDetailsRequest++;
      this.localCacheService.getLocation(inventoryMovement.locationId!).subscribe(
        {
          next: (locationRes) => {
            inventoryMovement.location = locationRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     * 
     */
    if (inventoryMovement.locationId && inventoryMovement.location == null) {

      this.loadingDetailsRequest++;
      /**
       * 
      inventoryMovement.location =  await this.localCacheService.getLocation(inventoryMovement.locationId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
       * 
       */
      inventoryMovement.location =  await lastValueFrom(this.localCacheService.getLocation(inventoryMovement.locationId!)).finally(
        () => this.loadingDetailsRequest--
      );
    } 
  }
  async loadPicksInformation(inventory: Inventory) {

    /**
     * 
    // load the pick informaiton
    if (inventory.pickId && inventory.pick == null) {
      this.loadingDetailsRequest++;
      this.localCacheService.getPick(inventory.pickId!).subscribe(
        {
          next: (pickRes) => {
            inventory.pick = pickRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     */
    // load the pick informaiton
    if (inventory.pickId && inventory.pick == null) {
      this.loadingDetailsRequest++;
      inventory.pick =  await this.localCacheService.getPick(inventory.pickId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 
  }
  async loadAllocateByPicksInformation(inventory: Inventory) {

    /**
    // load the allocate by pick informaiton
    if (inventory.allocatedByPickId && inventory.allocatedByPick == null) {
      this.loadingDetailsRequest++;
      this.localCacheService.getPick(inventory.allocatedByPickId!).subscribe(
        {
          next: (pickRes) => {
            inventory.allocatedByPick = pickRes;
            this.loadingDetailsRequest--;
          },
          error: () => this.loadingDetailsRequest--
        }
      )
    } 
     * 
     */
    // load the allocate by pick informaiton
    if (inventory.allocatedByPickId && inventory.allocatedByPick == null) {
      this.loadingDetailsRequest++;
      inventory.allocatedByPick =  await this.localCacheService.getPick(inventory.allocatedByPickId!).toPromise().finally(
        () => this.loadingDetailsRequest--
      );
    } 
  }
  async loadUnitOfMeasure(inventory: Inventory) {
    if (inventory.itemPackageType && inventory.itemPackageType.itemUnitOfMeasures &&
              inventory.itemPackageType.itemUnitOfMeasures.length > 0) {

      inventory.itemPackageType.itemUnitOfMeasures.filter(
        itemUnitOfMeasure  => itemUnitOfMeasure.unitOfMeasureId != null && 
                                  itemUnitOfMeasure.unitOfMeasure == null
      ).forEach(
          itemUnitOfMeasure => {
            
            this.loadingDetailsRequest++;
            this.localCacheService.getUnitOfMeasure(itemUnitOfMeasure.unitOfMeasureId!)
              .subscribe({
                next: (unitOfMeasureRes) => {
                  itemUnitOfMeasure.unitOfMeasure = unitOfMeasureRes;
                  this.loadingDetailsRequest--;
                
                }, 
                error: () => this.loadingDetailsRequest--
              })
          }
      )
    }
  } 
  
  async loadStockUnitOfMeasure(inventory: Inventory) {
    if (inventory.itemPackageType?.stockItemUnitOfMeasure?.unitOfMeasureId != null &&
      inventory.itemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure == null) {
 
        this.loadingDetailsRequest++;
        this.localCacheService.getUnitOfMeasure(inventory.itemPackageType.stockItemUnitOfMeasure.unitOfMeasureId!)
              .subscribe({
                next: (unitOfMeasureRes) => {
                  inventory.itemPackageType!.stockItemUnitOfMeasure!.unitOfMeasure = unitOfMeasureRes;
                  this.loadingDetailsRequest--;
                
                }, 
                error: () => this.loadingDetailsRequest--
              }) 
    }
  } 
  

  async loadDisplayUnitOfMeasure(inventory: Inventory) {
    if (inventory.itemPackageType?.displayItemUnitOfMeasure?.unitOfMeasureId != null &&
      inventory.itemPackageType?.displayItemUnitOfMeasure?.unitOfMeasure == null) {
 
        this.loadingDetailsRequest++;
        this.localCacheService.getUnitOfMeasure(inventory.itemPackageType.displayItemUnitOfMeasure.unitOfMeasureId!)
              .subscribe({
                next: (unitOfMeasureRes) => {
                  inventory.itemPackageType!.displayItemUnitOfMeasure!.unitOfMeasure = unitOfMeasureRes;
                  this.loadingDetailsRequest--;
                
                }, 
                error: () => this.loadingDetailsRequest--
              }) 
    }
  }  
 
  adjustInventory(inventory: Inventory): void {
    console.log(`will adjust inventory: ${  JSON.stringify(inventory)}`);
  }
  openRemoveInventoryModal(
    inventory: Inventory,
    tplInventoryRemovalModalTitle: TemplateRef<{}>,
    tplInventoryRemovalModalContent: TemplateRef<{}>,
  ): void {
    this.mapOfInprocessInventoryId[inventory.id!] = true;
    this.inventoryToBeRemoved = inventory;
    this.documentNumber = '';
    this.comment = '';

    this.inventoryRemovalModal = this.modalService.create({
      nzTitle: tplInventoryRemovalModalTitle,
      nzContent: tplInventoryRemovalModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryRemovalModal.destroy();
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        this.search();
      },
      nzOnOk: () => {
        this.removeInventory(this.inventoryToBeRemoved);
      },
      nzWidth: 1000,
    });
  }

  removeInventory(inventory: Inventory): void {
    this.isSpinning = true;
    this.inventoryService.adjustDownInventory(inventory, this.documentNumber, this.comment).subscribe(
      inventoryRes => {
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        this.isSpinning = false;
        if (inventoryRes.lockedForAdjust === true) {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.request-success'));
        } else {
          this.messageService.success(this.i18n.fanyi('message.inventory-adjust-result.adjust-success'));
        }
        this.search();
      },
      () => {
        this.mapOfInprocessInventoryId[inventory.id!] = false;
        this.isSpinning = false;
        this.messageService.error(this.i18n.fanyi('message.action.fail'));
      },
    );

    this.inventoryRemovalModal.destroy();
  }

  initSearchForm(): void {
    // initiate the search form

    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });

    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily =>
        this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }),
      );
    });
  }

  openMoveInventoryModal(
    inventory: Inventory,
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>, 
  ): void {
    this.mapOfInprocessInventoryId[inventory.id!] = true;
    this.inventoryMovementForm = this.fb.group({
      lpn: new UntypedFormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new UntypedFormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new UntypedFormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new UntypedFormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new UntypedFormControl({ value: inventory.quantity, disabled: true }),
      locationName: new UntypedFormControl({ value: inventory.location!.name, disabled: true }),
      destinationLocation: [null],
      immediateMove: [false],
    });

    this.batchMovement = false;
    // Load the location
    this.inventoryMoveModal = this.modalService.create({
      nzTitle: tplInventoryMoveModalTitle,
      nzContent: tplInventoryMoveModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryMoveModal.destroy();
        this.mapOfInprocessInventoryId[inventory.id!] = false;
      },
      nzOnOk: () => {
        this.moveInventory(
          inventory,
          this.inventoryMovementForm.value.destinationLocation,
          this.inventoryMovementForm.value.immediateMove,
        );
      },

      nzWidth: 1000,
    });
  }
  
  openBatchMoveInventoryModal( 
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>, 
  ): void { 
    this.inventoryMovementForm = this.fb.group({
       
      destinationLocation: [null],
      immediateMove: [false],
    });

    this.batchMovement = true;
    // Load the location
    this.inventoryMoveModal = this.modalService.create({
      nzTitle: tplInventoryMoveModalTitle,
      nzContent: tplInventoryMoveModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.inventoryMoveModal.destroy(); 
      },
      nzOnOk: () => {
        
        this.inventoryMoveModal.updateConfig({ 
          nzOkDisabled: true,
          nzOkLoading: true
        });
        this.moveInventoryInBatch(
          this.getSelectedInventory(),
          this.inventoryMovementForm.value.destinationLocation,
          this.inventoryMovementForm.value.immediateMove,
        );
        return false;
      },

      nzWidth: 1000,
    });
  }
   

  moveInventoryInBatch(inventories: Inventory[], destinationLocationName: string, immediateMove: boolean): void {
    this.isSpinning = true;
    this.locationService.getLocations(undefined, undefined, destinationLocationName).subscribe({
      next: (locationsRes) => { 
        if (locationsRes.length == 0 ||
          locationsRes[0].locationGroup?.locationGroupType?.fourWallInventory == false) {
          this.messageService.error(`can't find location with name ${destinationLocationName}`);
          this.isSpinning = false;
          
          this.inventoryMoveModal.updateConfig({ 
            nzOkDisabled: false,
            nzOkLoading: false
          });
        } 
        else {

          this.moveInventoryInBatchSteps(inventories, locationsRes[0], immediateMove, inventories.length - 1);
        }

        
      }, 
      error: () => this.isSpinning = false
    });  
  }
  moveInventoryInBatchSteps(inventories: Inventory[], location: WarehouseLocation, immediateMove: boolean, index: number): void {

    // stop if we already process all the items in the list
    if (index < 0) {
      this.isSpinning = false;
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.inventoryMoveModal.destroy(); 
      this.search();
      return;
    }
    // process the inventory at the index and recursively call to process the next
    this.inventoryService.move(inventories[index], location, immediateMove).subscribe({
      next: () => { 
        this.moveInventoryInBatchSteps(inventories, location, immediateMove, index - 1);
  
      }, 
      error: () => this.isSpinning = false
    });
  }
  moveInventory(inventory: Inventory, destinationLocationName: string, immediateMove: boolean): void {
    this.locationService.getLocations(undefined, undefined, destinationLocationName).subscribe(location => {
      this.inventoryService.move(inventory, location[0], immediateMove).subscribe(
        inventoryRes => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));

          this.mapOfInprocessInventoryId[inventory.id!] = false;
          // refresh with LPN
          this.searchForm.controls.lpn.setValue(inventory.lpn);
          this.search();
        },
        () => {
          this.messageService.error(this.i18n.fanyi('message.action.fail'));

          this.mapOfInprocessInventoryId[inventory.id!] = false;
        },
      );
    });
  }

  processItemQueryResult(selectedItemName: any): void {
    // console.log(`start to query with item name ${selectedItemName}`);
    this.searchForm.controls.itemName.setValue(selectedItemName);
  }
  processLocationQueryResult(selectedLocationName: any): void {
    // console.log(`start to query with location name ${selectedLocationName}`);
    this.inventoryMovementForm.value.destinationLocation.setValue(selectedLocationName);
  }


  processQueryLocationQueryResult(selectedLocationName: any): void {
    // console.log(`start to query with location name ${selectedLocationName}`);
    this.searchForm.controls.location.setValue(selectedLocationName);
  }

  printLPNReport(event: any, inventory: Inventory) {

    this.isSpinning = true;
    
    // console.log(`start to print lPN label for inventory \n${inventory}`);
    this.inventoryService.generateLPNLabel(
      inventory.lpn!, undefined, event.printerName)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        // console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "LPN Label",
          printResult.fileName,
          // ReportType.LPN_LABEL,
          printResult.type,   // The report type may be LPN_LABEL , RECEIVING_LPN_LABEL or PRODUCTION_LINE_ASSIGNMENT_LABEL
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          inventory.location?.locationGroup?.name, 
          printResult, event.collated);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewLPNReport(inventory: Inventory): void {


    this.isSpinning = true;
    this.inventoryService.generateLPNLabel(inventory.lpn!)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }
  processLocationValueQueryResult(event: Event) {
    console.log(`inventory selected: ${(event.target as HTMLInputElement).value}`)
  }

  
  removeSelectedInventory(asyncronized : boolean = false): void {
    // make sure we have at least one checkbox checked
    
    this.isSpinning = true;
    const selectedInventory = this.getSelectedInventory();
    if (selectedInventory.length > 0) {
      const inventoryIds = selectedInventory.map(inventory => inventory.id!).join(",");
        this.inventoryService.removeInventories(inventoryIds, asyncronized).subscribe(
          {
            next: (message) => {
              this.messageService.success(this.i18n.fanyi(message));
              this.isSpinning = false;
              this.search();
            }, 
            error: () => {
                    
              this.isSpinning = false;
              this.messageService.error(this.i18n.fanyi('message.action.fail'));
            }
          }

        )
    }
    else {
      
      this.isSpinning = false;
    }
    
  }
  
  getSelectedInventory(): Inventory[] {
    let selectedInventory: Inventory[] = [];
    
    const dataList: STData[] = this.inventoryTable.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedInventory = [...selectedInventory,
              ...this.inventories.filter(
                inventory => inventory.id == data["id"]
              )
          ]

        }
      );
    return selectedInventory;
  }
 
  changeDisplayItemUnitOfMeasure(inventory: Inventory, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (inventory.quantity! % itemUnitOfMeasure.quantity! == 0) {

      inventory.displayQuantity = inventory.quantity! / itemUnitOfMeasure.quantity!;
      inventory.itemPackageType!.displayItemUnitOfMeasure = itemUnitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the inventory's quantity ${ 
          inventory.quantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }
 
  exportResult() {  
     /***
      * 
      * 
    let data: STData[] = this.listOfDisplayInventories.map(
      (inventory) => ({
        lpn: inventory.lpn,
        location: inventory.location?.name,
        item: inventory.item?.name,
        itemColumn: inventory.item?.name,
        quantity: inventory.displayQuantity,
        unit: inventory.itemPackageType?.displayItemUnitOfMeasure?.unitOfMeasure?.name,

      })
    );
    // let data: STData[] = this.inventoryTable.data as STData[];
    console.log(`start to export data ${data}`)
    console.log(`columns: \n `)
    
    this.inventoryTable.columns?.forEach(
      column => console.log(`${JSON.stringify(column)}`)
    )
    this.inventoryTable.export(data,  { filename: 'via-data.xlsx', sheetname: 'user' });
      * 
      */
    console.log(`display inventory table columns`)
    this.inventoryTable.columns?.forEach(
      column => console.log(`>> ${JSON.stringify(column)}`)
    )

    var columnNames = this.getInventoryExportExcelColumns();
    var contents = this.getInventoryExportExcelRows(this.listOfDisplayInventories);


    var worksheet = XLSX.utils.aoa_to_sheet([
      columnNames, 
      ...contents
    ]); 
     

    /* generate workbook and add the worksheet */
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'inventory');

    /* save to file */
    XLSX.writeFile(workbook,`inventory.xlsx`);
  }

  getInventoryExportExcelColumns() : string[]   {

    let columnNames : string[] = [];

    if (this.isChoose('client')  && this.threePartyLogisticsFlag) {
      columnNames = [...columnNames, this.i18n.fanyi("client")];
    }
    if (this.isChoose('lpn')) {
      columnNames = [...columnNames, this.i18n.fanyi("lpn")];
    }
    if (this.isChoose('item')) {
      columnNames = [...columnNames, this.i18n.fanyi("item")];
    } 
    if (this.isChoose('itemPackageType')) {
      columnNames = [...columnNames, this.i18n.fanyi("item.package-type")];
    } 
    if (this.isChoose('location')) {
      columnNames = [...columnNames, this.i18n.fanyi("location")];
    } 
    if (this.isChoose('quantity')) {
      columnNames = [...columnNames, this.i18n.fanyi("quantity"), this.i18n.fanyi("unitOfMeasure")]; 
    }
    if (this.isChoose('inventoryStatus')) {
      columnNames = [...columnNames, this.i18n.fanyi("inventory.status")];
    }
    if (this.isChoose('fifoDate')) {
      columnNames = [...columnNames, this.i18n.fanyi("fifoDate")];
    }
    if (this.isChoose('color')) {
      columnNames = [...columnNames, this.i18n.fanyi("color")];
    }
    if (this.isChoose('productSize')) {
      columnNames = [...columnNames, this.i18n.fanyi("productSize")];
    }
    if (this.isChoose('style')) {
      columnNames = [...columnNames, this.i18n.fanyi("style")];
    }
    if (this.isChoose('inWarehouseDate')) {
      columnNames = [...columnNames, this.i18n.fanyi("inWarehouseDate")];
    }
    if (this.isChoose('attribute1') && this.inventoryConfiguration?.inventoryAttribute1Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName];
    }
    if (this.isChoose('attribute2') && this.inventoryConfiguration?.inventoryAttribute2Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName];
    }
    if (this.isChoose('attribute3') && this.inventoryConfiguration?.inventoryAttribute3Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName];
    }
    if (this.isChoose('attribute4') && this.inventoryConfiguration?.inventoryAttribute4Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName];
    }
    if (this.isChoose('attribute5') && this.inventoryConfiguration?.inventoryAttribute5Enabled == true) {
      columnNames = [...columnNames, this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
        this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName];
    }
    if (this.isChoose('lockedForAdjust')) {
      columnNames = [...columnNames, this.i18n.fanyi("inventory.locked-for-adjustment")];
    }
    if (this.isChoose('pick')) {
      columnNames = [...columnNames, this.i18n.fanyi("inventory.pick-id")];
    }
    if (this.isChoose('allocateByPick')) {
      columnNames = [...columnNames, this.i18n.fanyi("inventory.allocated-by-pick-id")];
    }
    if (this.isChoose('movementPath')) {
      columnNames = [...columnNames, this.i18n.fanyi("movement-path")];
    }


    return columnNames;
  }
  
  getInventoryExportExcelRows(inventoryList: Inventory[]) : string[][]   {
    let rows: string[][] = [];

    inventoryList.forEach(
      inventory => rows = [...rows, this.getInventoryExportExcelRow(inventory)]
    )
    return rows;
  }
  
  getInventoryExportExcelRow(inventory: Inventory) : string[]   {
    let row : string[] = [];

    if (this.isChoose('client')  && this.threePartyLogisticsFlag) {
      row = [...row, inventory.client == null ? "" : inventory.client.name];
    }
    if (this.isChoose('lpn')) {
      row = [...row, inventory.lpn == null ? "" : inventory.lpn]; 
    }
    if (this.isChoose('item')) {
      row = [...row, inventory.item == null ? "" : inventory.item.name];  
    } 
    if (this.isChoose('itemPackageType')) {
      row = [...row, inventory.itemPackageType == null ? "" : inventory.itemPackageType.name!];  
    } 
    if (this.isChoose('location')) {
      row = [...row, inventory.location == null ? "" : inventory.location.name!];  
    } 
    if (this.isChoose('quantity')) {
      row = [...row, 
        (inventory.displayQuantity == null ? "" : inventory.displayQuantity.toString()), 
        (inventory.itemPackageType  == null || 
          inventory.itemPackageType.displayItemUnitOfMeasure   == null ||
          inventory.itemPackageType.displayItemUnitOfMeasure.unitOfMeasure == null ?
            "" :
            inventory.itemPackageType.displayItemUnitOfMeasure.unitOfMeasure.name)];   
    }
    if (this.isChoose('inventoryStatus')) {
      row = [...row, inventory.inventoryStatus == null ? "" : inventory.inventoryStatus.name!];  
    }
    if (this.isChoose('fifoDate')) {
      row = [...row, inventory.fifoDate == null ? "" : 
           `${this.datePipe.transform(inventory.fifoDate, 'MM/dd/yyyy')}`];   
    }
    if (this.isChoose('color')) {
      row = [...row, inventory.color == null ? "" : inventory.color];   
    }
    if (this.isChoose('productSize')) {
      row = [...row, inventory.productSize == null ? "" : inventory.productSize];   
    }
    if (this.isChoose('style')) {
      row = [...row, inventory.style == null ? "" : inventory.style];   
    }
    if (this.isChoose('inWarehouseDate')) {
      row = [...row, inventory.inWarehouseDatetime == null ? "" : inventory.inWarehouseDatetime.toString()];   
    }
    if (this.isChoose('attribute1') && this.inventoryConfiguration?.inventoryAttribute1Enabled == true) {
      row = [...row, inventory.attribute1 == null ? "" : inventory.attribute1];   
    }
    if (this.isChoose('attribute2') && this.inventoryConfiguration?.inventoryAttribute2Enabled == true) {
      row = [...row, inventory.attribute2 == null ? "" : inventory.attribute2];   
    }
    if (this.isChoose('attribute3') && this.inventoryConfiguration?.inventoryAttribute3Enabled == true) {
      row = [...row, inventory.attribute3 == null ? "" : inventory.attribute3];   
    }
    if (this.isChoose('attribute4') && this.inventoryConfiguration?.inventoryAttribute4Enabled == true) {
      row = [...row, inventory.attribute4 == null ? "" : inventory.attribute4];   
    }
    if (this.isChoose('attribute5') && this.inventoryConfiguration?.inventoryAttribute5Enabled == true) {
      row = [...row, inventory.attribute5 == null ? "" : inventory.attribute5];   
    }
    if (this.isChoose('lockedForAdjust')) {
      row = [...row, inventory.lockedForAdjust == null ? "" : inventory.lockedForAdjust + ""];   
    }
    if (this.isChoose('pick')) {
      row = [...row, inventory.pick == null ? "" : inventory.pick.number ];   
    }
    if (this.isChoose('allocateByPick')) {
      row = [...row, inventory.allocatedByPick == null ? "" : inventory.allocatedByPick.number ];   
    }
    if (this.isChoose('movementPath')) {
      let movementPath = inventory.inventoryMovements?.map(
        movement => movement?.location?.name
      ).join(",")
      row = [...row, movementPath == null ? "" : movementPath ];   
    }


    return row;
  }

  inventoryTableRecordPerPageChanged(recordPerPage: any) {
    console.log(`recordPerPage is changed to ${recordPerPage}`);

  }

  inventoryDisplayOptionChanged() {
    console.log(`inventory display is changed to ${this.inventoryDisplayOption}`);

    // setup the display based on the display option
    this.processInventoryQueryResult(this.inventories);
  }

  reverseInventory(inventory: Inventory) {
    
    this.isSpinning = true;
    if (inventory.receiptId != null) { 
        this.inventoryService.reverseReceivedInventory(inventory, true, true).subscribe(
          {
            next: () => {
              this.messageService.success(this.i18n.fanyi('message.action.success'));
              this.isSpinning = false;
              this.search();
            }, 
            error: () => {
                    
              this.isSpinning = false; 
            }
          }

        )
    } 
    else if (inventory.workOrderId != null) { 
      this.workOrderService.reverseProduction(inventory.workOrderId, inventory.lpn!).subscribe(
        {
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.isSpinning = false;
            this.search();
          }, 
          error: () => {
                  
            this.isSpinning = false; 
          }
        }

      )
  } 

  }

  inventoryTableChanged(event: STChange) : void { 
    if (event.type === 'pi' || event.type === 'ps') {
      // see if the PI or PS is changed. If so
      // we will need to redo the search since we use 
      // client size pagination
      const pipsChanged : boolean = 
          (this.inventoryTablePI != this.inventoryTable.pi) ||
          (this.inventoryTablePS != this.inventoryTable.ps);
 
      if (pipsChanged) {
        this.inventoryTablePI = this.inventoryTable.pi;
        this.inventoryTablePS = this.inventoryTable.ps;
        this.search();
      }

    }

  }

}
