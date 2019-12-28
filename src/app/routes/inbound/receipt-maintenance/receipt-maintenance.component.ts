import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzModalRef, NzModalService, NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { Client } from '../../common/models/client';
import { Supplier } from '../../common/models/supplier';
import { ReceiptLine } from '../models/receipt-line';
import { ReceiptService } from '../services/receipt.service';
import { ClientService } from '../../common/services/client.service';
import { SupplierService } from '../../common/services/supplier.service';
import { Receipt } from '../models/receipt';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ReceiptLineService } from '../services/receipt-line.service';
import { ItemService } from '../../inventory/services/item.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { PutawayConfigurationService } from '../services/putaway-configuration.service';

@Component({
  selector: 'app-inbound-receipt-maintenance',
  templateUrl: './receipt-maintenance.component.html',
})
export class InboundReceiptMaintenanceComponent implements OnInit {
  receiptForm: FormGroup;
  receivingForm: FormGroup;
  pageTitle: string;
  currentReceipt: Receipt = {
    id: null,
    number: '',
    client: null,
    clientId: null,
    supplier: null,
    supplierId: null,
    receiptStatus: ReceiptStatus.OPEN,
    receiptLines: [],
  };

  validClients: Client[];
  validSuppliers: Supplier[];

  listOfAllReceiptLines: ReceiptLine[] = [];
  listOfDisplayReceiptLines: ReceiptLine[] = [];

  listOfAllReceivedInventory: Inventory[] = [];
  listOfDisplayReceivedInventory: Inventory[] = [];

  // control for table of receipt line
  // checkbox - select all
  receiptLinesTableAllChecked = false;
  receiptLinesTableIndeterminate = false;
  // list of checked checkbox
  receiptLinesTableMapOfCheckedId: { [key: string]: boolean } = {};

  receivedInventoryTableAllChecked = false;
  receivedInventoryTableIndeterminate = false;
  // list of checked checkbox
  receivedInventoryTableMapOfCheckedId: { [key: string]: boolean } = {};

  receivingModal: NzModalRef;
  addReceiptLineModal: NzModalRef;

  currentInventory: Inventory;
  availableInventoryStatuses: InventoryStatus[];

  currentReceiptLine: ReceiptLine;

  receiptStatus = ReceiptStatus;

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
    private message: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inbound.receipt.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inbound.receipt.title'));

    this.receiptForm = this.fb.group({
      receiptId: [null],
      receiptNumber: [null],
      client: [null],
      supplier: [null],
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

  saveReceipt() {
    // Setup the value
    this.currentReceipt.id = this.receiptForm.controls.receiptId.value;
    this.currentReceipt.number = this.receiptForm.controls.receiptNumber.value;

    // Get the client by name
    const client = this.getClientByName(this.receiptForm.controls.client.value);
    this.currentReceipt.clientId = client ? client.id : null;
    this.currentReceipt.client = client ? client : null;

    // Get the supplier by name
    const supplier = this.getSupplierByName(this.receiptForm.controls.supplier.value);
    this.currentReceipt.supplierId = supplier ? supplier.id : null;
    this.currentReceipt.supplier = supplier ? supplier : null;

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
      });
    }
  }

  getClientByName(name: string): Client {
    const clients = this.validClients.filter(client => client.name === name);
    if (clients.length > 0) {
      return clients[0];
    } else {
      return null;
    }
  }

  getSupplierByName(name: string): Supplier {
    const suppliers = this.validSuppliers.filter(supplier => supplier.name === name);
    if (suppliers.length > 0) {
      return suppliers[0];
    } else {
      return null;
    }
  }

  clearDisplay() {
    this.listOfAllReceiptLines = [];
    this.listOfDisplayReceiptLines = [];

    this.listOfAllReceivedInventory = [];
    this.listOfDisplayReceivedInventory = [];

    this.receiptForm.controls.receiptId.setValue('');
    this.receiptForm.controls.receiptNumber.setValue('');
    this.receiptForm.controls.receiptNumber.enable();

    // this.receiptForm.controls.client.setValue('');
    // this.receiptForm.controls.supplier.setValue('');
  }

  setupDisplay() {
    this.listOfAllReceiptLines = this.currentReceipt.receiptLines;
    this.listOfDisplayReceiptLines = this.currentReceipt.receiptLines;

    this.receiptForm.controls.receiptId.setValue(this.currentReceipt.id);
    this.receiptForm.controls.receiptId.disable();
    this.receiptForm.controls.receiptNumber.setValue(this.currentReceipt.number);
    this.receiptForm.controls.receiptNumber.disable();

    this.receiptForm.controls.client.setValue(this.currentReceipt.client ? this.currentReceipt.client.name : '');
    this.receiptForm.controls.supplier.setValue(this.currentReceipt.supplier ? this.currentReceipt.supplier.name : '');

    this.loadReceivedInventory(this.currentReceipt);
  }

  receiptNumberOnBlur(receiptNumber?: string) {
    // When we use the 'fkey' to automatically generate the next receipt number
    // the reactive form control may not have the right value.Let's set
    // the number back to the bind control
    this.receiptForm.controls.receiptNumber.setValue(receiptNumber);
    this.refreshReceiptResults();
  }

  refreshReceiptResults() {
    const receiptNumber = this.receiptForm.controls.receiptNumber.value;
    if (receiptNumber) {
      this.loadReceipt(receiptNumber);
    } else {
      this.clearDisplay();
    }
  }

  loadReceipt(receiptNumber: string) {
    this.receiptService.getReceipts(receiptNumber).subscribe(receipts => {
      if (receipts.length > 0) {
        this.currentReceipt = receipts[0];
        this.setupDisplay();
      } else {
        this.clearDisplay();
        // in case the receipt doesn't exists yet, let's set the
        // receipt number control as the input value
        this.receiptForm.controls.receiptNumber.setValue(receiptNumber);
        console.log(`this.receiptForm.controls.receiptNumber: ${this.receiptForm.controls.receiptNumber.value}`);
      }
    });
  }

  loadReceivedInventory(receipt: Receipt) {
    this.receiptService.getReceivedInventory(receipt).subscribe(inventories => {
      this.listOfAllReceivedInventory = inventories;
      this.listOfDisplayReceivedInventory = inventories;
    });
  }

  receiptLinesCurrentPageDataChange($event: ReceiptLine[]): void {
    this.listOfDisplayReceiptLines = $event;
    this.receiptLinesTableRefreshStatus();
  }

  receiptLinesTableRefreshStatus(): void {
    this.receiptLinesTableAllChecked = this.listOfDisplayReceiptLines.every(
      item => this.receiptLinesTableMapOfCheckedId[item.id],
    );
    this.receiptLinesTableIndeterminate =
      this.listOfDisplayReceiptLines.some(item => this.receiptLinesTableMapOfCheckedId[item.id]) &&
      !this.receiptLinesTableAllChecked;
  }

  receiptLinesTableCheckAll(value: boolean): void {
    this.listOfDisplayReceiptLines.forEach(item => (this.receiptLinesTableMapOfCheckedId[item.id] = value));
    this.receiptLinesTableRefreshStatus();
  }

  sortReceiptLinesTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfDisplayReceiptLines = this.listOfDisplayReceiptLines.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfDisplayReceiptLines = this.listOfAllReceiptLines;
    }
  }

  getSelectedReceiptLines(): ReceiptLine[] {
    const selectedReceiptLines: ReceiptLine[] = [];
    this.listOfDisplayReceiptLines.forEach((receiptLine: ReceiptLine) => {
      if (this.receiptLinesTableMapOfCheckedId[receiptLine.id] === true) {
        selectedReceiptLines.push(receiptLine);
      }
    });
    return selectedReceiptLines;
  }

  receivedInventoryCurrentPageDataChange($event: Inventory[]): void {
    this.listOfDisplayReceivedInventory = $event;
    this.receivedInventoryTableRefreshStatus();
  }

  receivedInventoryTableRefreshStatus(): void {
    this.receivedInventoryTableAllChecked = this.listOfDisplayReceivedInventory.every(
      item => this.receivedInventoryTableMapOfCheckedId[item.id],
    );
    this.receivedInventoryTableIndeterminate =
      this.listOfDisplayReceivedInventory.some(item => this.receivedInventoryTableMapOfCheckedId[item.id]) &&
      !this.receivedInventoryTableAllChecked;
  }

  receivedInventoryTableCheckAll(value: boolean): void {
    this.listOfDisplayReceivedInventory.forEach(item => (this.receivedInventoryTableMapOfCheckedId[item.id] = value));
    this.receivedInventoryTableRefreshStatus();
  }

  sortReceivedInventoryTable(sort: { key: string; value: string }): void {
    if (sort.key && sort.value) {
      this.listOfDisplayReceivedInventory = this.listOfDisplayReceivedInventory.sort((a, b) =>
        sort.value === 'ascend' ? (a[sort.key!] > b[sort.key!] ? 1 : -1) : b[sort.key!] > a[sort.key!] ? 1 : -1,
      );
    } else {
      this.listOfDisplayReceivedInventory = this.listOfAllReceivedInventory;
    }
  }

  getSelectedReceivedInventory(): Inventory[] {
    const selectedReceivedInventory: Inventory[] = [];
    this.listOfDisplayReceivedInventory.forEach((inventory: Inventory) => {
      if (this.receivedInventoryTableMapOfCheckedId[inventory.id] === true) {
        selectedReceivedInventory.push(inventory);
      }
    });
    return selectedReceivedInventory;
  }

  printSelectedPutawayWork() {}

  printAllPutawayWork() {}

  openReceivingModal(
    receiptLine: ReceiptLine,
    tplReceivingModalTitle: TemplateRef<{}>,
    tplReceivingModalContent: TemplateRef<{}>,
  ) {
    this.currentInventory = {
      id: null,
      lpn: '',
      location: null,
      item: receiptLine.item,
      itemPackageType: null,
      quantity: null,
      inventoryStatus: null,
    };
    // Load the location

    this.locationService.getLocations(null, null, this.currentReceipt.number).subscribe(locations => {
      if (locations.length > 0) {
        this.currentInventory.location = locations[0];

        // show the model
        this.receivingModal = this.modalService.create({
          nzTitle: tplReceivingModalTitle,
          nzContent: tplReceivingModalContent,
          nzOkText: this.i18n.fanyi('description.field.button.confirm'),
          nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
          nzMaskClosable: false,
          nzOnCancel: () => {
            this.receivingModal.destroy();
            this.refreshReceiptResults();
          },
          nzOnOk: () => {
            this.receivingInventory(this.currentReceipt.id, receiptLine.id, this.currentInventory);
          },
          nzWidth: 1000,
        });
      }
    });
  }
  receivingLPNChanged(lpn: string) {
    this.currentInventory.lpn = lpn;
  }

  itemPackageTypeChange(newItemPackageTypeName) {
    const itemPackageTypes = this.currentInventory.item.itemPackageTypes.filter(
      itemPackageType => itemPackageType.name === newItemPackageTypeName,
    );
    if (itemPackageTypes.length === 1) {
      this.currentInventory.itemPackageType = itemPackageTypes[0];
    }
  }
  inventoryStatusChange(newInventoryStatusName) {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        this.currentInventory.inventoryStatus = inventoryStatus;
      }
    });
  }

  receivingInventory(receiptId: number, receiptLineId: number, inventory: Inventory) {
    this.receiptLineService.receiveInventory(receiptId, receiptLineId, inventory).subscribe(receivedInventory => {
      this.message.success(this.i18n.fanyi('message.receiving.success'));
      this.refreshReceiptResults();
    });
  }

  showAddReceiptLineModal(tplReceiptLineModalTitle: TemplateRef<{}>, tplReceiptLineModalContent: TemplateRef<{}>) {
    if (!this.currentReceipt.id) {
      this.message.error('message.error.saveReceiptFirst');
      return;
    }
    this.currentReceiptLine = {
      id: null,
      number: null,
      item: null,
      expectedQuantity: 0,
      receivedQuantity: 0,
    };
    // calculate the next line number
    this.receiptLineService
      .getNextReceiptLineNumber(this.currentReceipt.id)
      .subscribe(nextNumber => (this.currentReceiptLine.number = nextNumber));
    // show the model
    this.addReceiptLineModal = this.modalService.create({
      nzTitle: tplReceiptLineModalTitle,
      nzContent: tplReceiptLineModalContent,
      nzOkText: this.i18n.fanyi('description.field.button.confirm'),
      nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
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

  addReceiptLine(receiptLine: ReceiptLine) {
    this.receiptLineService.createReceiptLine(this.currentReceipt.id, receiptLine).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.new.complete'));
      this.refreshReceiptResults();
    });
  }

  currentReceiptLineItemNumberChanged(itemNumber: string) {
    if (itemNumber) {
      this.itemService
        .getItems(itemNumber)
        .subscribe(items => (this.currentReceiptLine.item = items.length > 0 ? items[0] : null));
    } else {
      this.currentReceiptLine.item = null;
    }
  }
  removeSelectedReceiptLines() {}

  allocateLocation(inventory: Inventory) {
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
  reallocateLocation(inventory: Inventory) {
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
}
