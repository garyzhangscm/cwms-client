import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Client } from '../../common/models/client';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { Supplier } from '../../common/models/supplier';
import { ClientService } from '../../common/services/client.service';
import { PrintingService } from '../../common/services/printing.service';
import { SupplierService } from '../../common/services/supplier.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemService } from '../../inventory/services/item.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Receipt } from '../models/receipt';
import { ReceiptLine } from '../models/receipt-line';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { PutawayConfigurationService } from '../services/putaway-configuration.service';
import { ReceiptLineService } from '../services/receipt-line.service';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-inbound-receipt-maintenance',
  templateUrl: './receipt-maintenance.component.html',
})
export class InboundReceiptMaintenanceComponent implements OnInit {
  listOfReceiptLineTableColumns: ColumnItem[] = [
    {
      name: 'receipt.line.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.expectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.receivedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.receivedQuantity, b.receivedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.overReceivingQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.overReceivingQuantity, b.overReceivingQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'receipt.line.overReceivingPercent',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReceiptLine, b: ReceiptLine) => this.utilService.compareNullableNumber(a.overReceivingPercent, b.overReceivingPercent),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfReceivedInventoryTableColumns: ColumnItem[] = [
    {
      name: 'lpn',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableString(a.lpn, b.lpn),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'item.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.item, b.item, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'quantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableNumber(a.quantity, b.quantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'inventory.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.inventoryStatus, b.inventoryStatus, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Inventory, b: Inventory) => this.utilService.compareNullableObjField(a.location, b.location, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'nextLocation',
      showSort: false,
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  listOfReceiptLinesTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onReceiptLinesTableAllChecked(true);
      }
    },
  ];

  listOfReceivedInventoryTableSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onReceivedInventoryTableAllChecked(true);
      }
    },
  ];

  setOfReceiptLinesTableCheckedId = new Set<number>();
  receiptLinesTableChecked = false;
  receiptLinesTableIndeterminate = false;


  setOfReceivedInventoryTableCheckedId = new Set<number>();
  receivedInventoryTableChecked = false;
  receivedInventoryTableIndeterminate = false;

  receiptForm!: FormGroup;
  receivingForm!: FormGroup;
  pageTitle: string;
  currentReceipt: Receipt = {
    id: undefined,
    number: '',
    client: undefined,
    clientId: undefined,
    supplier: undefined,
    supplierId: undefined,
    warehouseId: this.warehouseService.getCurrentWarehouse().id,
    receiptStatus: ReceiptStatus.OPEN,
    receiptLines: [],
    allowUnexpectedItem: false,
  };

  validClients: Client[] = [];
  validSuppliers: Supplier[] = [];

  listOfAllReceiptLines: ReceiptLine[] = [];
  listOfDisplayReceiptLines: ReceiptLine[] = [];

  listOfAllReceivedInventory: Inventory[] = [];
  listOfDisplayReceivedInventory: Inventory[] = [];


  receivingModal!: NzModalRef;
  addReceiptLineModal!: NzModalRef;
  manualPutawayModal!: NzModalRef;

  currentInventory!: Inventory;
  availableInventoryStatuses: InventoryStatus[] = [];

  currentReceiptLine!: ReceiptLine;
  currentReceivingLine!: ReceiptLine;

  receiptStatus = ReceiptStatus;

  selectedTabIndex = 0;
  printingInProcess = false;
  printingPutawayWork = false;
  displayItemPackageType: ItemPackageType | undefined;
  receivingInProcess = false;

  isSpinning = false;
  // how to print putaway work
  // all: print everything recevied, include the one that already in stock
  // allReceived: print everything that is received and still not putaway yet
  // selected: print only selected record
  printPutawayWorkType = "all";
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private fb: FormBuilder,
    private receiptService: ReceiptService,
    private receiptLineService: ReceiptLineService,
    private clientService: ClientService,
    private supplierService: SupplierService,
    private modalService: NzModalService,
    private inventoryStatusService: InventoryStatusService,
    private putawayConfigurationService: PutawayConfigurationService,
    private itemService: ItemService,
    private locationService: LocationService,
    private inventoryService: InventoryService,
    private message: NzMessageService,
    private warehouseService: WarehouseService,
    private utilService: UtilService,
    private router: Router,
    private printingService: PrintingService,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inbound.receipt.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inbound.receipt.title'));

    this.receiptForm = this.fb.group({
      receiptId: [null],
      receiptNumber: ['', [Validators.required]],
      client: [null],
      supplier: [null],
      allowUnexpectedItem: [false],
    });
    this.receiptForm.controls.receiptId.disable();

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.receiptNumber) {
        this.loadReceipt(params.receiptNumber);
      } else {
        this.listOfAllReceiptLines = [];
        this.listOfDisplayReceiptLines = [];
      }
    });

    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));

    this.clientService.loadClients().subscribe(clients => (this.validClients = clients));
    this.supplierService.loadSuppliers().subscribe(suppliers => (this.validSuppliers = suppliers));
  }

  saveReceipt(): void {
    // Setup the value
    this.currentReceipt.id = this.receiptForm!.controls.receiptId.value;
    this.currentReceipt.number = this.receiptForm!.controls.receiptNumber.value;

    // Get the client by name
    const client = this.getClientByName(this.receiptForm!.controls.client.value);
    this.currentReceipt.clientId = client ? client.id : undefined;
    this.currentReceipt.client = client ? client : undefined;

    // Get the supplier by name
    const supplier = this.getSupplierByName(this.receiptForm!.controls.supplier.value);
    this.currentReceipt.supplierId = supplier ? supplier.id : undefined;
    this.currentReceipt.supplier = supplier ? supplier : undefined;

    if (this.currentReceipt.id) {
      // we are changing an exiting receipt
      this.receiptService.changeReceipt(this.currentReceipt).subscribe(res => {
        this.refreshReceiptResults();
        this.message.success(this.i18n.fanyi('message.save.complete'));
      });
    } else {
      // we are creating a new receipt
      this.receiptService.addReceipt(this.currentReceipt).subscribe(res => {
        this.currentReceipt = res;
        this.setupDisplay();
        this.message.success(this.i18n.fanyi('message.new.complete'));

        this.receiptForm!.controls.receiptId.setValue(res.id);
        this.receiptForm!.controls.receiptId.disable();
        this.receiptForm!.controls.receiptNumber.setValue(res.number);
        this.receiptForm!.controls.receiptNumber.disable();
      });
    }
  }

  getClientByName(name: string): Client | null {
    const clients = this.validClients.filter(client => client.name === name);
    if (clients.length > 0) {
      return clients[0];
    } else {
      return null;
    }
  }

  getSupplierByName(name: string): Supplier | null {
    const suppliers = this.validSuppliers.filter(supplier => supplier.name === name);
    if (suppliers.length > 0) {
      return suppliers[0];
    } else {
      return null;
    }
  }

  clearDisplay(): void {
    this.listOfAllReceiptLines = [];
    this.listOfDisplayReceiptLines = [];

    this.listOfAllReceivedInventory = [];
    this.listOfDisplayReceivedInventory = [];

    this.receiptForm!.controls.receiptId.setValue('');
    this.receiptForm!.controls.receiptNumber.setValue('');
    this.receiptForm!.controls.receiptNumber.enable();

    // this.receiptForm.controls.client.setValue('');
    // this.receiptForm.controls.supplier.setValue('');
  }

  setupDisplay(): void {
    this.listOfAllReceiptLines = this.currentReceipt.receiptLines;
    this.listOfDisplayReceiptLines = this.currentReceipt.receiptLines;

    this.receiptForm!.controls.receiptId.setValue(this.currentReceipt.id);
    this.receiptForm!.controls.receiptId.disable();
    this.receiptForm!.controls.receiptNumber.setValue(this.currentReceipt.number);
    this.receiptForm!.controls.receiptNumber.disable();

    this.receiptForm!.controls.client.setValue(this.currentReceipt.client ? this.currentReceipt.client.name : '');
    this.receiptForm!.controls.supplier.setValue(this.currentReceipt.supplier ? this.currentReceipt.supplier.name : '');

    this.loadReceivedInventory(this.currentReceipt);
  }

  receiptNumberOnBlur(receiptNumber?: string): void {
    // When we use the 'fkey' to automatically generate the next receipt number
    // the reactive form control may not have the right value.Let's set
    // the number back to the bind control
    this.receiptForm!.controls.receiptNumber.setValue(receiptNumber);
    this.refreshReceiptResults();
  }

  refreshReceiptResults(selectedTabIndex: number = 0): void {
    this.selectedTabIndex = selectedTabIndex;
    const receiptNumber = this.receiptForm!.controls.receiptNumber.value;
    if (receiptNumber) {
      this.loadReceipt(receiptNumber);
    } else {
      this.clearDisplay();
    }
  }

  loadReceipt(receiptNumber: string): void {
    this.receiptService.getReceipts(receiptNumber).subscribe(receipts => {
      if (receipts.length > 0) {
        this.currentReceipt = receipts[0];
        this.setupDisplay();
      } else {
        this.clearDisplay();
        // in case the receipt doesn't exists yet, let's set the
        // receipt number control as the input value
        this.receiptForm!.controls.receiptNumber.setValue(receiptNumber);
        console.log(`this.receiptForm.controls.receiptNumber: ${this.receiptForm!.controls.receiptNumber.value}`);
      }
    });
  }
  calculateQuantities(receipt: Receipt): Receipt {
    const existingItemIds = new Set();
    receipt.totalExpectedQuantity = 0;
    receipt.totalReceivedQuantity = 0;
    receipt.totalLineCount = receipt.receiptLines.length;

    receipt.receiptLines.forEach(receiptLine => {
      receipt.totalExpectedQuantity! += receiptLine.expectedQuantity!;
      receipt.totalReceivedQuantity! += receiptLine.receivedQuantity!;
      if (!existingItemIds.has(receiptLine.item!.id)) {
        existingItemIds.add(receiptLine.item!.id);
      }
    });
    receipt.totalItemCount = existingItemIds.size;
    return receipt;
  }

  loadReceivedInventory(receipt: Receipt): void {
    this.receiptService.getReceivedInventory(receipt).subscribe(inventories => {
      this.listOfAllReceivedInventory = inventories;
      this.listOfDisplayReceivedInventory = inventories;
    });
  }

  updateReceiptLinesTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfReceiptLinesTableCheckedId.add(id);
    } else {
      this.setOfReceiptLinesTableCheckedId.delete(id);
    }
  }

  onReceiptLinesTableItemChecked(id: number, checked: boolean): void {
    this.updateReceiptLinesTableCheckedSet(id, checked);
    this.refreshReceiptLinesTableCheckedStatus();
  }

  onReceiptLinesTableAllChecked(value: boolean): void {
    this.listOfDisplayReceivedInventory!.forEach(item => this.updateReceiptLinesTableCheckedSet(item.id!, value));
    this.refreshReceiptLinesTableCheckedStatus();
  }

  receiptLinesTableCurrentPageDataChange($event: ReceiptLine[]): void {
    this.listOfDisplayReceivedInventory! = $event;
    this.refreshReceiptLinesTableCheckedStatus();
  }

  refreshReceiptLinesTableCheckedStatus(): void {
    this.receiptLinesTableChecked =
      this.listOfDisplayReceivedInventory!.every(item => this.setOfReceiptLinesTableCheckedId.has(item.id!));
    this.receiptLinesTableIndeterminate =
      this.listOfDisplayReceivedInventory!.some(item => this.setOfReceiptLinesTableCheckedId.has(item.id!)) && !this.receiptLinesTableChecked;
  }

  updateReceivedInventoryTableCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfReceivedInventoryTableCheckedId.add(id);
    } else {
      this.setOfReceivedInventoryTableCheckedId.delete(id);
    }
  }

  onReceivedInventoryTableItemChecked(id: number, checked: boolean): void {
    this.updateReceivedInventoryTableCheckedSet(id, checked);
    this.refreshReceivedInventoryTableCheckedStatus();
  }

  onReceivedInventoryTableAllChecked(value: boolean): void {
    this.listOfDisplayReceivedInventory!.forEach(item => this.updateReceivedInventoryTableCheckedSet(item.id!, value));
    this.refreshReceivedInventoryTableCheckedStatus();
  }

  receivedInventoryTableCurrentPageDataChange($event: ReceiptLine[]): void {
    this.listOfDisplayReceivedInventory! = $event;
    this.refreshReceivedInventoryTableCheckedStatus();
  }

  refreshReceivedInventoryTableCheckedStatus(): void {
    this.receivedInventoryTableChecked =
      this.listOfDisplayReceivedInventory!.every(item => this.setOfReceivedInventoryTableCheckedId.has(item.id!));
    this.receivedInventoryTableIndeterminate =
      this.listOfDisplayReceivedInventory!.some(item => this.setOfReceivedInventoryTableCheckedId.has(item.id!)) && !this.receiptLinesTableChecked;
  }



  getSelectedReceiptLines(): ReceiptLine[] {
    const selectedReceiptLines: ReceiptLine[] = [];
    this.listOfAllReceiptLines.forEach((receiptLine: ReceiptLine) => {
      if (this.setOfReceiptLinesTableCheckedId.has(receiptLine.id!)) {
        selectedReceiptLines.push(receiptLine);
      }
    });
    return selectedReceiptLines;
  }

  getSelectedReceivedInventory(): Inventory[] {
    const selectedReceivedInventory: Inventory[] = [];
    this.listOfDisplayReceivedInventory.forEach((inventory: Inventory) => {
      if (this.setOfReceivedInventoryTableCheckedId.has(inventory.id!)) {
        selectedReceivedInventory.push(inventory);
      }
    });
    return selectedReceivedInventory;
  }

  printPutawayWork(event: any) {

    switch (this.printPutawayWorkType) {
      case "all":
        this.printAllPutawayWork(event);
        break;
      case "allReceived":
        this.printAllReceivedPutawayWork(event);
        break;
      case "selected":
        this.printSelectedPutawayWork(event);
        break;
      default:
        this.printAllPutawayWork(event);
        break;
    }

  }
  previewPutawayReport() {

    switch (this.printPutawayWorkType) {
      case "all":
        this.previewAllPutawayWork(event);
        break;
      case "allReceived":
        this.previewAllReceivedPutawayWork(event);
        break;
      case "selected":
        this.previewSelectedPutawayWork(event);
        break;
      default:
        this.previewAllPutawayWork(event);
        break;
    }

  }
  printPutawayDocument(event: any,
    receipt: Receipt, inventoryIds: number[],
    notPutawayInventoryOnly = false): void {


    this.isSpinning = true;
    console.log(`start to print ${this.currentReceipt.number} `);

    this.receiptService.printPutawayDocument(
      receipt, inventoryIds, notPutawayInventoryOnly,
      this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        this.printingService.printRemoteFileByName(
          "Putaway Document",
          printResult.fileName,
          ReportType.PUTAWAY_DOCUMENT,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );
  }

  previewPutawayDocument(event: any,
    receipt: Receipt, inventoryIds: number[],
    notPutawayInventoryOnly = false): void {

    this.isSpinning = true;
    console.log(`start to preview putaway document for ${this.currentReceipt.number}`);


    this.receiptService.printPutawayDocument(
      receipt, inventoryIds, notPutawayInventoryOnly,
      this.i18n.currentLang)
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
  printSelectedPutawayWork(event: any): void {
    let selectedInventory = this.getSelectedInventory().map(
      inventory => inventory.id!
    );
    this.printPutawayDocument(event, this.currentReceipt,
      selectedInventory);
  }
  previewSelectedPutawayWork(event: any): void {
    let selectedInventory = this.getSelectedInventory().map(
      inventory => inventory.id!
    );
    this.previewPutawayDocument(event, this.currentReceipt,
      selectedInventory);
  }



  printAllReceivedPutawayWork(event: any): void {
    this.printPutawayDocument(event, this.currentReceipt,
      [], true);

  }
  previewAllReceivedPutawayWork(event: any): void {
    this.previewPutawayDocument(event, this.currentReceipt,
      [], true);

  }

  printAllPutawayWork(event: any): void {

    this.printPutawayDocument(event, this.currentReceipt,
      []);
  }

  previewAllPutawayWork(event: any): void {

    this.previewPutawayDocument(event, this.currentReceipt,
      []);
  }
  getSelectedInventory(): Inventory[] {
    const selectedInventories: Inventory[] = [];
    this.listOfAllReceivedInventory.forEach((inventory: Inventory) => {
      if (this.setOfReceivedInventoryTableCheckedId.has(inventory.id!)) {
        selectedInventories.push(inventory);
      }
    });
    return selectedInventories;
  }

  openReceivingModal(
    receiptLine: ReceiptLine,
    tplReceivingModalTitle: TemplateRef<{}>,
    tplReceivingModalContent: TemplateRef<{}>,
    tplReceivingModalFooter: TemplateRef<{}>,
  ): void {
    this.createReceivingForm(receiptLine);
    this.receivingInProcess = false;

    // show the model
    this.receivingModal = this.modalService.create({
      nzTitle: tplReceivingModalTitle,
      nzContent: tplReceivingModalContent,
      nzFooter: tplReceivingModalFooter,

      nzWidth: 1000,
    });
    this.receivingModal.afterOpen.subscribe(() => this.setupDefaultInventoryValue());
  }
  closeReceivingModal(): void {
    this.receivingModal.destroy();
    this.refreshReceiptResults();
  }
  confirmReceiving(): void {
    this.receivingInProcess = true;
    this.receivingInventory();
  }

  createReceivingForm(receiptLine: ReceiptLine): void {
    // reset the displayed item package type
    this.displayItemPackageType = undefined;
    this.currentReceivingLine = receiptLine;
    this.receivingForm = this.fb.group({
      itemNumber: new FormControl({ value: receiptLine.item!.name, disabled: true }),
      itemDescription: new FormControl({ value: receiptLine.item!.description, disabled: true }),
      lpn: ['', Validators.required],
      inventoryStatus: ['', Validators.required],
      itemPackageType: ['', Validators.required],
      quantity: ['', Validators.required],
      locationName: [''],
    });
  }
  openManualPutawayModal(
    inventory: Inventory,
    tplManualPutawayModalTitle: TemplateRef<{}>,
    tplManualPutawayModalContent: TemplateRef<{}>,
  ): void {
    this.currentInventory = inventory;
    // Load the location
    this.manualPutawayModal = this.modalService.create({
      nzTitle: tplManualPutawayModalTitle,
      nzContent: tplManualPutawayModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.manualPutawayModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.manualPutawayInventory(this.currentInventory!);
      },
      nzWidth: 1000,
    });
  }
  manualPutawayInventory(inventory: Inventory): void {
    if (inventory.locationName) {
      // Location name is setup
      // Let's find the location by name and assign it to the inventory
      // that will be received
      console.log(`Will setup received inventory's location to ${inventory.locationName}`);

      this.locationService.getLocations(undefined, undefined, inventory.locationName).subscribe(locations => {
        // There should be only one location returned.
        // Move the inventory to the location
        this.inventoryService.move(inventory, locations[0]).subscribe(() => {
          this.message.success(this.i18n.fanyi('message.action.success'));
          this.refreshReceiptResults();
        });
      });
    }
  }

  receivingLPNChanged(lpn: string): void {
    this.receivingForm!.controls.lpn.setValue(lpn);
  }
  setupDefaultInventoryValue(): void {
    if (this.currentReceivingLine.item!.itemPackageTypes.length === 1) {
      this.receivingForm!.controls.itemPackageType.setValue(this.currentReceivingLine.item!.itemPackageTypes[0].id);
      this.displayItemPackageType = this.currentReceivingLine.item!.itemPackageTypes[0];
    }
    if (this.availableInventoryStatuses.length === 1) {
      this.receivingForm!.controls.inventoryStatus.setValue(this.availableInventoryStatuses[0].id);
    }
  }

  inventoryStatusChange(newInventoryStatusName: string): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        this.currentInventory!.inventoryStatus = inventoryStatus;
      }
    });
  }

  receivingInventory(): void {
    if (this.receivingForm.valid) {
      // check if the location name is input. If so, we receive into that location
      // otherwise, we receive into the reciept location
      const locationName =
        this.receivingForm.controls.locationName.value === ''
          ? this.currentReceipt.number
          : this.receivingForm.controls.locationName.value;
      this.locationService.getLocations(undefined, undefined, locationName).subscribe(locations => {
        this.receiptLineService
          .receiveInventory(
            this.currentReceipt.id!,
            this.currentReceivingLine.id!,
            this.createReceivingInventory(this.currentReceivingLine, locations[0]),
          )
          .subscribe(
            () => {
              this.message.success(this.i18n.fanyi('message.receiving.success'));

              this.receivingModal.destroy();
              this.receivingInProcess = false;

              this.refreshReceiptResults();
            },
            () => (this.receivingInProcess = false),
          );
      });
    } else {
      this.displayReceivingFormError(this.receivingForm);
      this.receivingInProcess = false;
    }
  }
  displayReceivingFormError(fromGroup: FormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }

  createReceivingInventory(receiptLine: ReceiptLine, receiptLocation: WarehouseLocation): Inventory {
    const inventoryStatus = this.availableInventoryStatuses
      .filter(
        availableInventoryStatus => availableInventoryStatus.id === this.receivingForm.controls.inventoryStatus.value,
      )
      .pop();
    const itemPackageType = receiptLine.item!.itemPackageTypes
      .filter(
        existingItemPackageType => existingItemPackageType.id === this.receivingForm.controls.itemPackageType.value,
      )
      .pop();

    return {
      id: undefined,
      lpn: this.receivingForm.controls.lpn.value,
      location: receiptLocation,
      locationName: receiptLocation.name,
      item: receiptLine.item,
      itemPackageType,
      quantity: this.receivingForm.controls.quantity.value,
      inventoryStatus,
    };
  }

  showAddReceiptLineModal(tplReceiptLineModalTitle: TemplateRef<{}>, tplReceiptLineModalContent: TemplateRef<{}>): void {
    this.currentReceiptLine = {
      id: undefined,
      number: undefined,
      item: undefined,
      expectedQuantity: 0,
      receivedQuantity: 0,
      overReceivingQuantity: 0,
      overReceivingPercent: 0,
    };
    // calculate the next line number
    this.receiptLineService
      .getNextReceiptLineNumber(this.currentReceipt.id!)
      .subscribe(nextNumber => (this.currentReceiptLine.number = nextNumber));
    // show the model
    this.addReceiptLineModal = this.modalService.create({
      nzTitle: tplReceiptLineModalTitle,
      nzContent: tplReceiptLineModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addReceiptLineModal.destroy();
        this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.addReceiptLine(this.currentReceiptLine);
      },
      nzWidth: 1000,
    });
  }

  addReceiptLine(receiptLine: ReceiptLine): void {
    this.receiptLineService.createReceiptLine(this.currentReceipt.id!, receiptLine).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.new.complete'));
      this.refreshReceiptResults();
    });
  }

  currentReceiptLineItemNumberChanged(itemNumber: string): void {
    if (itemNumber) {
      this.itemService
        .getItems(itemNumber)
        .subscribe(items => (this.currentReceiptLine.item = items.length > 0 ? items[0] : undefined));
    } else {
      this.currentReceiptLine.item = undefined;
    }
  }
  removeSelectedReceiptLines(): void {
    const selectedReceiptLines = this.getSelectedReceiptLines();
    if (selectedReceiptLines.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.receiptLineService.removeReceiptLines(selectedReceiptLines).subscribe(res => {
            this.message.success(this.i18n.fanyi('message.remove.complete'));
            this.refreshReceiptResults();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  allocateLocation(inventory: Inventory): void {
    this.putawayConfigurationService.allocateLocation(inventory).subscribe(allocatedInventory => {
      this.message.success(this.i18n.fanyi('message.allocate-location.success'));
      this.listOfAllReceivedInventory.forEach(receivedInventory => {
        if (receivedInventory.id === allocatedInventory.id) {
          receivedInventory.inventoryMovements = allocatedInventory.inventoryMovements;
        }
      });
      this.listOfDisplayReceivedInventory = this.listOfAllReceivedInventory;
    });
  }
  reallocateLocation(inventory: Inventory): void {
    this.putawayConfigurationService.reallocateLocation(inventory).subscribe(allocatedInventory => {
      this.message.success(this.i18n.fanyi('message.allocate-location.success'));
      this.listOfAllReceivedInventory.forEach(receivedInventory => {
        if (receivedInventory.id === allocatedInventory.id) {
          receivedInventory.inventoryMovements = allocatedInventory.inventoryMovements;
        }
      });
      this.listOfDisplayReceivedInventory = this.listOfAllReceivedInventory;
    });
  }

  confirmPutaway(index: number, receivedInventory: Inventory): void {
    this.inventoryService
      .move(receivedInventory, receivedInventory.inventoryMovements![index].location)
      .subscribe(inventory => this.refreshReceiptResults(1));
  }
  manualPutaway(receivedInventory: Inventory): void { }
  printReceipt(event: any): void {

    this.isSpinning = true;
    console.log(`start to print receiving document: ${this.currentReceipt.number} `);

    this.receiptService.printReceivingDocument(
      this.currentReceipt, this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.SERVER_URL}/resource/report-histories/download/${printResult.fileName}`;
        console.log(`will print file: ${printFileUrl}`);
        this.printingService.printRemoteFileByName(
          "Receiving Document",
          printResult.fileName,
          ReportType.RECEIVING_DOCUMENT,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }

  // Allow reserve inventory now
  isInventoryReversible(inventory: Inventory): boolean {
    return this.currentReceipt.receiptStatus !== ReceiptStatus.CLOSED;
  }
  // reserve inventory
  reverseInventory(inventory: Inventory): void {
    this.inventoryService.reverseReceivedInventory(inventory).subscribe(removedInventoryRes => {
      // reload the receipt inventory
      this.loadReceipt(this.currentReceipt.number);
      this.message.success(this.i18n.fanyi('message.action.success'));
    });
  }

  get lpnControl(): AbstractControl | null {
    return this.receivingForm.get('lpn');
  }

  previewReport(): void {


    this.isSpinning = true;
    console.log(`start to preview ${this.currentReceipt.number}`);
    this.receiptService.printReceivingDocument(this.currentReceipt, this.i18n.currentLang)
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

}
