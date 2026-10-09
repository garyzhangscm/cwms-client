import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, HostListener, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subscription, catchError, forkJoin, firstValueFrom, from, interval, map, mergeMap, of, timeout } from 'rxjs';

import { UserService } from '../../auth/services/user.service';
import { PrintingService } from '../../common/services/printing.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { SystemControlledNumberService } from '../../util/services/system-controlled-number.service';
import { PrintingStrategy } from '../../warehouse-layout/models/printing-strategy.enum';
import { WarehouseConfiguration } from '../../warehouse-layout/models/warehouse-configuration';
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineType } from '../models/production-line-type';
import { WorkOrder } from '../models/work-order';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { ProductionLineTypeService } from '../services/production-line-type.service';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderProduceTransactionService } from '../services/work-order-produce-transaction.service';
import { WorkOrderService } from '../services/work-order.service';
import { ProductionLabelJob, ProductionLabelReceiptService } from '../services/production-label-receipt.service';
import { ReportHistory } from '../../report/models/report-history';

@Component({
  selector: 'app-work-order-production-line-dashboard',
  templateUrl: './production-line-dashboard.component.html',
  styleUrls: ['./production-line-dashboard.component.less'],
  standalone: false
})
export class WorkOrderProductionLineDashboardComponent implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  isKioskMode = false;
  private nativeFullscreenActive = false;
  lastUpdated: Date | null = null;
  readonly collapsedWorkOrderLimit = 1;
  private readonly expandedProductionLines = new Set<string>();

  private productionLineKey(line: ProductionLine): string {
    return `${line.warehouseId ?? ''}:${line.id ?? line.name}`;
  }

  isProductionLineExpanded(line: ProductionLine): boolean {
    return this.expandedProductionLines.has(this.productionLineKey(line));
  }

  toggleProductionLineExpanded(line: ProductionLine): void {
    const key = this.productionLineKey(line);
    if (this.expandedProductionLines.has(key)) this.expandedProductionLines.delete(key);
    else this.expandedProductionLines.add(key);
  }

  visibleWorkOrders(line: ProductionLine): NonNullable<ProductionLine['assignedWorkOrders']> {
    const orders = line.assignedWorkOrders ?? [];
    return this.isProductionLineExpanded(line) ? orders : orders.slice(0, this.collapsedWorkOrderLimit);
  }

  get assignedLineCount(): number {
    return this.productionLines.filter(line => line.assignedWorkOrders?.length).length;
  }

  async enterKioskMode(): Promise<void> {
    this.isKioskMode = true;
    this.document.body.classList.add('mes-kanban-kiosk');
    if (this.document.fullscreenEnabled && !this.document.fullscreenElement) {
      try {
        await this.document.documentElement.requestFullscreen();
        this.nativeFullscreenActive = true;
      } catch {
        // The full-window layout remains available when browser fullscreen is unavailable.
      }
    }
  }

  exitKioskMode(): void {
    this.isKioskMode = false;
    this.document.body.classList.remove('mes-kanban-kiosk');
    if (this.nativeFullscreenActive && this.document.fullscreenElement) {
      void this.document.exitFullscreen().catch(() => {});
    }
    this.nativeFullscreenActive = false;
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    if (this.nativeFullscreenActive && !this.document.fullscreenElement) this.exitKioskMode();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isKioskMode && !this.document.fullscreenElement) this.exitKioskMode();
  }

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;
  selectedProductionLineTypes: string[] = ['All'];
  private refreshSubscription?: Subscription;
  private itemInformationSubscription?: Subscription;
  readonly itemLoadingFailed = new Set<number>();
  isProducing = false;
  productionJobMessage = '';
  productionJobRetry = false;
  private readonly receiptService = inject(ProductionLabelReceiptService);
  private pendingLabelJob?: ProductionLabelJob;
  private readonly printedLpns = new Set<string>();
  private readonly labelReports = new Map<string, ReportHistory>();
  private productionJobSubscription?: Subscription;
  private readonly printAbort = new AbortController();
  private readonly recoveryKey = 'mes-production-label-job-v1';

  get allProductionLineTypesSelected(): boolean {
    return this.selectedProductionLineTypes.includes('All');
  }
  productionLineTypes: (ProductionLineType & { name: string })[] = [];
  productionLines: ProductionLine[] = [];
  workOrders: WorkOrder[] = [];
  doNotRefreshFlag = false;
  autoGenerateNewLPNFlag = true;
  onlyShowActiveProductionLineFlag = true;

  // production line and work order that the current production will take place
  currentProductionLineName = '';
  currentWorkOrderName = '';
  validInventoryStatuses: InventoryStatus[] = [];
  availableInventoryStatus?: InventoryStatus;
  currentProducingItem?: Item;
  currentProducingItemPackageType?: ItemPackageType;
  currentProducingUnitOfMeasure?: ItemUnitOfMeasure;
  produceAtLPNUOM = false;

  productionLineTypeLocalStorageKey = 'production_line_dashboard_production_line_key';
  refreshCountCycleLocalStorageKey = 'production_line_dashboard_refresh_cycle_key';
  doNotRefreshLocalStorageKey = 'production_line_dashboard_donot_fresh_key';
  autoGenerateNewLPNLocalStorageKey = 'production_line_dashboard_auto_generate_new_lpn';
  onlyShowActiveProductionLineLocalStorageKey = 'production_line_dashboard_only_show_production_line';

  refreshCountCycle = 60;
  countDownNumber = this.refreshCountCycle;
  countDownsubscription!: Subscription;
  warehouseConfiguration?: WarehouseConfiguration;
  loadingData = false;
  showConfiguration = false;

  produceInventoryModal!: NzModalRef;

  @ViewChild('producingInventoryQuantity', { static: false }) producingInventoryQuantity!: ElementRef;

  private readonly fb = inject(FormBuilder);

  produceInventoryForm = this.fb.nonNullable.group({
    lpn: this.fb.control('', { nonNullable: true, validators: [] }),
    itemNumber: this.fb.control('', { nonNullable: true, validators: [] }),
    itemDescription: this.fb.control('', { nonNullable: true, validators: [] }),
    inventoryStatus: this.fb.control<number | undefined>(undefined, { nonNullable: true, validators: [Validators.required] }),
    itemPackageType: this.fb.control<number | undefined>(undefined, { nonNullable: true, validators: [Validators.required] }),
    quantity: this.fb.control<number | undefined>(undefined, { nonNullable: true, validators: [Validators.required] }),
    producingUnitOfMeasure: this.fb.control<number | undefined>(undefined, { nonNullable: true, validators: [Validators.required] })
  });

  displayOnly = false;

  constructor(
    private http: _HttpClient,
    private formBuilder: FormBuilder,
    private messageService: NzMessageService,
    private productionLineService: ProductionLineService,
    private productionLineTypeService: ProductionLineTypeService,
    private systemControlledNumberService: SystemControlledNumberService,
    private workOrderService: WorkOrderService,
    private workOrderProduceTransactionService: WorkOrderProduceTransactionService,
    private modalService: NzModalService,
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    private inventoryStatusService: InventoryStatusService,
    private warehouseConfigurationService: WarehouseConfigurationService,
    private printingService: PrintingService,
    private userService: UserService
  ) {
    userService
      .isCurrentPageDisplayOnly('/work-order/production-line-dashboard')
      .then(displayOnlyFlag => (this.displayOnly = displayOnlyFlag));

    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe({
      next: warehouseConfigurationRes => {
        this.warehouseConfiguration = warehouseConfigurationRes;
      }
    });
  }

  ngOnInit(): void {
    this.restorePendingLabelJob();
    this.loadAvailableProductionLineTypes();
    this.loadInventoryStatuses();

    const savedTypes = localStorage.getItem(this.productionLineTypeLocalStorageKey);
    if (savedTypes !== null) {
      // Preserve the previous single-type setting while saving new selections as arrays.
      try {
        const parsed: unknown = JSON.parse(savedTypes);
        if (Array.isArray(parsed) && parsed.every(type => typeof type === 'string')) {
          this.selectedProductionLineTypes = parsed.includes('All') ? ['All'] : [...new Set<string>(parsed)];
        }
      } catch {
        this.selectedProductionLineTypes = [savedTypes];
      }
    }
    if (localStorage.getItem(this.refreshCountCycleLocalStorageKey)) {
      this.refreshCountCycle = +localStorage.getItem(this.refreshCountCycleLocalStorageKey)!;
      this.countDownNumber = this.refreshCountCycle;
    }

    if (localStorage.getItem(this.doNotRefreshLocalStorageKey)) {
      this.doNotRefreshFlag = localStorage.getItem(this.doNotRefreshLocalStorageKey) === 'true';
    }
    if (localStorage.getItem(this.autoGenerateNewLPNLocalStorageKey)) {
      this.autoGenerateNewLPNFlag = localStorage.getItem(this.autoGenerateNewLPNLocalStorageKey) === 'true';
    }
    if (localStorage.getItem(this.onlyShowActiveProductionLineLocalStorageKey)) {
      this.onlyShowActiveProductionLineFlag = localStorage.getItem(this.onlyShowActiveProductionLineLocalStorageKey) === 'true';
    }

    this.refresh();

    this.countDownsubscription = interval(1000).subscribe(x => {
      this.handleCountDownEvent();
    });
  }
  loadInventoryStatuses(): void {
    this.inventoryStatusService.loadInventoryStatuses().subscribe({
      next: inventoryStatusRes => {
        this.validInventoryStatuses = inventoryStatusRes;
        this.validInventoryStatuses.forEach(inventoryStatus => {
          if (inventoryStatus.availableStatusFlag) {
            this.availableInventoryStatus = inventoryStatus;
          }
        });
      }
    });
  }
  loadAvailableProductionLineTypes(): void {
    this.productionLineTypeService.getProductionLineTypes().subscribe({
      next: productionLineTypeRes => {
        this.productionLineTypes = productionLineTypeRes.filter(
          (type): type is ProductionLineType & { name: string } => typeof type.name === 'string' && type.name.length > 0
        );
      }
    });
  }

  refresh(): void {
    this.refreshSubscription?.unsubscribe();
    this.itemInformationSubscription?.unsubscribe();
    if (this.selectedProductionLineTypes.length === 0) {
      this.productionLines = [];
      this.isSpinning = false;
      this.lastUpdated = new Date();
      return;
    }
    this.isSpinning = true;
    // The existing backend accepts one type per request. Merge selected types here.
    const types: (string | undefined)[] = this.allProductionLineTypesSelected
      ? [undefined] : this.selectedProductionLineTypes;
    this.refreshSubscription = forkJoin(types.map(type =>
      this.productionLineService.getProductionLines(undefined, type, false, false)
    )).subscribe({
      next: lineGroups => {
        const seen = new Set<string>();
        const productionLineRes = lineGroups.flat().filter(line => {
          const key = `${line.warehouseId ?? ''}:${line.id ?? line.name}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        if (this.onlyShowActiveProductionLineFlag) {
          // ok, we will only show the active production line
          this.productionLines = productionLineRes.filter(
            productionLine => productionLine.assignedWorkOrders && productionLine.assignedWorkOrders.length > 0
          );
        } else {
          this.productionLines = productionLineRes;
        }

        this.loadItemInformationForProductionLines(this.productionLines);

        this.lastUpdated = new Date();
        this.isSpinning = false;
      },
      error: () => (this.isSpinning = false)
    });
  }

  // Load independent items concurrently, with one request per item in this refresh.
  loadItemInformationForProductionLines(productionLines: ProductionLine[]): void {
    this.itemInformationSubscription?.unsubscribe();
    this.itemLoadingFailed.clear();
    const assignmentsByItem = new Map<number, NonNullable<ProductionLine['assignedWorkOrders']>>();
    for (const line of productionLines ?? []) {
      for (const order of line.assignedWorkOrders ?? []) {
        if (order.second || order.sixth == null) continue;
        const assignments = assignmentsByItem.get(order.sixth) ?? [];
        assignments.push(order);
        assignmentsByItem.set(order.sixth, assignments);
      }
    }
    this.itemInformationSubscription = from(assignmentsByItem.entries()).pipe(
      mergeMap(([itemId, assignments]) => this.itemService.getItem(itemId).pipe(
        timeout(10000),
        map(item => {
          for (const order of assignments) {
            order.second = item.name;
            order.third = item.description;
          }
        }),
        catchError(() => {
          this.itemLoadingFailed.add(itemId);
          return of(undefined);
        })
      ), 6)
    ).subscribe();
  }

  handleCountDownEvent(): void {
    // don't refresh the result if the flag is checked
    if (this.doNotRefreshFlag) {
      return;
    }

    // don't count down when we are loading data
    if (this.loadingData) {
      this.resetCountDownNumber();
      return;
    }
    this.countDownNumber--;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();

      this.refresh();
    }
  }

  resetCountDownNumber() {
    this.countDownNumber = this.refreshCountCycle;
  }

  ngOnDestroy() {
    this.printAbort.abort();
    this.productionJobSubscription?.unsubscribe();
    this.exitKioskMode();
    this.countDownsubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
    this.itemInformationSubscription?.unsubscribe();
  }

  refreshCountCycleChanged() {
    localStorage.setItem(this.refreshCountCycleLocalStorageKey, this.refreshCountCycle.toString());
  }
  doNotRefreshFlagChanged() {
    localStorage.setItem(this.doNotRefreshLocalStorageKey, this.doNotRefreshFlag.toString());
  }
  onlyShowActiveProductionLineFlagChanged() {
    localStorage.setItem(this.onlyShowActiveProductionLineLocalStorageKey, this.onlyShowActiveProductionLineFlag.toString());
  }
  autoGenerateNewLPNFlagChanged() {
    localStorage.setItem(this.autoGenerateNewLPNLocalStorageKey, this.autoGenerateNewLPNFlag.toString());
  }
  productionLineTypeSelectionChanged(type: string, checked: boolean): void {
    if (type === 'All') {
      this.selectedProductionLineTypes = checked ? ['All'] : [];
    } else {
      const selected = this.selectedProductionLineTypes.filter(name => name !== 'All' && name !== type);
      this.selectedProductionLineTypes = checked ? [...selected, type] : selected;
    }
    localStorage.setItem(this.productionLineTypeLocalStorageKey, JSON.stringify(this.selectedProductionLineTypes));
    this.refresh();
  }

  openProducingInventoryModal(
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>,
    productionLine: ProductionLine,
    workOrderNumber: string,
    itemName: string,
    itemDescription: string
  ): void {
    if (this.isProducing) return;
    this.isSpinning = true;
    this.itemService.getItems(itemName).subscribe({
      next: itemRes => {
        this.isSpinning = false;

        this.currentProducingItem = itemRes[0];

        // setup default item package type and unit of measure
        // for the item
        this.currentProducingItemPackageType = this.currentProducingItem?.defaultItemPackageType;
        if (this.currentProducingItemPackageType) {
          this.newInventoryItemPackageTypeChanged(this.currentProducingItemPackageType.id!);
        } else {
          this.currentProducingUnitOfMeasure = undefined;
        }

        if (this.autoGenerateNewLPNFlag) {
          this.systemControlledNumberService.getNextAvailableId('lpn').subscribe(nextLPN => {
            this.openProducingInventoryModalWithNewLPN(
              tplInventoryMoveModalTitle,
              tplInventoryMoveModalContent,
              productionLine,
              workOrderNumber,
              this.currentProducingItem!,
              nextLPN
            );
          });
        } else {
          this.openProducingInventoryModalWithNewLPN(
            tplInventoryMoveModalTitle,
            tplInventoryMoveModalContent,
            productionLine,
            workOrderNumber,
            this.currentProducingItem!,
            ''
          );
        }
      },
      error: () => {
        this.isSpinning = false;
        this.messageService.error(`can't find the item ${itemName}`);
      }
    });
  }

  openProducingInventoryModalWithNewLPN(
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>,
    productionLine: ProductionLine,
    workOrderNumber: string,
    item: Item,
    newLPN: string
  ): void {
    this.currentProductionLineName = productionLine.name;
    this.currentWorkOrderName = workOrderNumber;

    // console.log(`openProducingInventoryModalWithNewLPN with status ${JSON.stringify(this.availableInventoryStatus)} and item package type ${JSON.stringify(this.currentProducingItemPackageType)}`);

    this.produceInventoryForm.controls.lpn.setValue(newLPN);
    this.produceInventoryForm.controls.itemNumber.setValue(item.name);
    this.produceInventoryForm.controls.itemNumber.disable();

    this.produceInventoryForm.controls.itemDescription.setValue(item.description);
    this.produceInventoryForm.controls.itemDescription.disable();

    this.produceInventoryForm.controls.inventoryStatus.setValue(this.availableInventoryStatus?.id);
    this.produceInventoryForm.controls.itemPackageType.setValue(
      this.currentProducingItemPackageType?.id ? this.currentProducingItemPackageType?.id : undefined
    );
    this.produceInventoryForm.controls.quantity.setValue(this.produceAtLPNUOM ? 1 : undefined);
    this.produceInventoryForm.controls.producingUnitOfMeasure.setValue(this.currentProducingUnitOfMeasure?.id);

    if (this.produceAtLPNUOM) {
      this.produceInventoryForm.get('quantity')?.disable();
    } else {
      this.produceInventoryForm.get('quantity')?.enable();
    }

    // Load the location
    this.produceInventoryModal = this.modalService.create({
      nzTitle: tplInventoryMoveModalTitle,
      nzContent: tplInventoryMoveModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.produceInventoryModal.destroy();
      },
      nzOnOk: () => {
        // disable the OK button to prevent double receiving
        this.produceInventoryModal.updateConfig({
          nzOkDisabled: true,
          nzOkLoading: true
        });

        console.log(`this.produceInventoryForm.valid: ${this.produceInventoryForm.valid}`);

        if (!this.produceInventoryForm.valid) {
          Object.values(this.produceInventoryForm.controls).forEach(control => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          });

          this.produceInventoryModal.updateConfig({
            nzOkDisabled: false,
            nzOkLoading: false
          });
          return false;
        }
        if (!this.currentProducingUnitOfMeasure) {
          this.messageService.error("can't get the UOM information");

          this.produceInventoryModal.updateConfig({
            nzOkDisabled: false,
            nzOkLoading: false
          });
          return false;
        }
        // get the unit quantity first
        let unitQuantity =
          (this.produceInventoryForm.value.quantity ? this.produceInventoryForm.value.quantity : 1) *
          this.currentProducingUnitOfMeasure!.quantity!;
        this.produceInventory(workOrderNumber, productionLine, unitQuantity);

        // Keep the modal protected until the submit request has completed.
        return false;
      },

      nzWidth: 1000
    });
    this.produceInventoryModal.afterOpen.subscribe(() => {
      setTimeout(() => {
        if (this.producingInventoryQuantity.nativeElement) {
          this.producingInventoryQuantity.nativeElement.focus();
          console.log(`focus on the quantity field`);
        }
      }, 0);
    });
  }

  producingUnitOfMeasureChanged(itemUnitOfMeasureId: number) {
    if (this.currentProducingItemPackageType != null) {
      this.currentProducingUnitOfMeasure = this.currentProducingItemPackageType!.itemUnitOfMeasures.find(
        itemUnitOfMeasure => itemUnitOfMeasure.id == itemUnitOfMeasureId
      );
    }

    if (this.currentProducingUnitOfMeasure && this.currentProducingUnitOfMeasure.trackingLpn) {
      this.produceAtLPNUOM = true;
      if (this.produceInventoryForm) {
        this.produceInventoryForm.controls.quantity.setValue(1);
        this.produceInventoryForm.get('quantity')?.disable();
      }
    } else {
      this.produceAtLPNUOM = false;
      this.produceInventoryForm.get('quantity')?.enable();
    }
  }
  newInventoryItemPackageTypeChanged(itemPackageTypeId: number) {
    let selectedItemPackageType: ItemPackageType | undefined = this.currentProducingItem!.itemPackageTypes!.find(
      itemPackageType => (itemPackageType.id = itemPackageTypeId)
    );

    this.currentProducingItemPackageType = selectedItemPackageType;

    if (selectedItemPackageType != null) {
      if (selectedItemPackageType.defaultWorkOrderReceivingUOM) {
        // set the display unit of measure
        // console.log(`set the display item unit of measure to \n${JSON.stringify(selectedItemPackageType.defaultWorkOrderReceivingUOM)}`);

        this.currentProducingUnitOfMeasure = selectedItemPackageType.defaultWorkOrderReceivingUOM;
        if (this.produceInventoryForm) {
          this.produceInventoryForm!.controls.producingUnitOfMeasure.setValue(this.currentProducingUnitOfMeasure.id);
        }
        this.producingUnitOfMeasureChanged(this.currentProducingUnitOfMeasure.id!);
        // this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure.id);
      } else if (selectedItemPackageType.displayItemUnitOfMeasure) {
        // set the display unit of measure
        // console.log(`set the display item unit of measure to \n${JSON.stringify(selectedItemPackageType.displayItemUnitOfMeasure)}`);

        this.currentProducingUnitOfMeasure = selectedItemPackageType.displayItemUnitOfMeasure;
        if (this.produceInventoryForm) {
          this.produceInventoryForm!.controls.producingUnitOfMeasure.setValue(this.currentProducingUnitOfMeasure.id);
        }
        this.producingUnitOfMeasureChanged(this.currentProducingUnitOfMeasure.id!);
        // this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure.id);
      } else if (selectedItemPackageType.stockItemUnitOfMeasure) {
        // set the display unit of measure
        // console.log(`set the display stock item unit of measure to \n${JSON.stringify(selectedItemPackageType.stockItemUnitOfMeasure)}`);

        this.currentProducingUnitOfMeasure = selectedItemPackageType.stockItemUnitOfMeasure;
        if (this.produceInventoryForm) {
          this.produceInventoryForm!.controls.producingUnitOfMeasure.setValue(this.currentProducingUnitOfMeasure.id);
        }
        this.producingUnitOfMeasureChanged(this.currentProducingUnitOfMeasure.id!);
      }
    }
  }

  produceInventory(workOrderNumber: string, productionLine: ProductionLine, unitQuantity: number): void {
    this.isSpinning = true;

    const inventoryStatus = this.validInventoryStatuses.find(is => is.id! === this.produceInventoryForm.value.inventoryStatus);

    const workOrderProduceTransaction: WorkOrderProduceTransaction = {
      workOrderNumber: workOrderNumber,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      workOrderLineConsumeTransactions: [],
      workOrderProducedInventories: [
        {
          lpn: this.produceInventoryForm.value.lpn ? this.produceInventoryForm.value.lpn : undefined,
          quantity: unitQuantity,
          inventoryStatusId: this.produceInventoryForm.value.inventoryStatus ? this.produceInventoryForm.value.inventoryStatus : undefined,
          inventoryStatus: inventoryStatus,
          itemPackageTypeId: this.produceInventoryForm.value.itemPackageType ? this.produceInventoryForm.value.itemPackageType : undefined,
          itemPackageType: this.currentProducingItemPackageType
        }
      ],
      consumeByBomQuantity: false,
      workOrderByProductProduceTransactions: [],
      workOrderKPITransactions: [],
      productionLine: productionLine
    };

    this.saveWorkOrderProduceResults(workOrderProduceTransaction);
  }
  saveWorkOrderProduceResults(request: WorkOrderProduceTransaction): void {
    if (this.isProducing) return;
    this.isProducing = true;
    this.productionJobRetry = false;
    this.productionJobMessage = 'Submitting production…';
    this.productionJobSubscription = this.workOrderProduceTransactionService.saveWorkOrderProduceTransaction(request).subscribe({
      next: saved => {
        this.produceInventoryModal.destroy();
        this.isSpinning = false;
        const shouldPrint = this.warehouseConfiguration?.newLPNPrintLabelAtProducingFlag &&
          this.warehouseConfiguration?.printingStrategy === PrintingStrategy.LOCAL_PRINTER_SERVER_DATA;
        if (!shouldPrint) {
          this.isProducing = false;
          this.productionJobMessage = 'Production submitted.';
          this.refreshProductionLine(request.productionLine!);
          return;
        }
        if (!saved?.id || !saved.workOrder?.id || !saved.warehouseId || !saved.workOrderProducedInventories?.length ||
          saved.workOrderProducedInventories.some(inventory => !inventory.lpn || !inventory.quantity)) {
          this.productionJobMessage = 'Production submitted, but its receipt could not be verified. Check the LPN before submitting again.';
          return;
        }
        this.pendingLabelJob = {
          transactionId: saved.id, warehouseId: saved.warehouseId, workOrderId: saved.workOrder.id,
          productionLineName: request.productionLine?.name,
          labels: saved.workOrderProducedInventories.map(inventory => ({ lpn: inventory.lpn?.trim() ?? '', quantity: inventory.quantity! }))
        };
        this.printedLpns.clear();
        this.labelReports.clear();
        this.persistPendingLabelJob();
        this.continueProductionLabelJob();
      },
      error: () => {
        this.isSpinning = false;
        this.produceInventoryModal.updateConfig({ nzOkDisabled: true, nzOkLoading: false });
        this.productionJobMessage = 'Submission could not be confirmed. Check the LPN before submitting again.';
        this.messageService.error(this.productionJobMessage);
      }
    });
  }

  continueProductionLabelJob(): void {
    const job = this.pendingLabelJob;
    if (!job) return;
    if (job.warehouseId !== this.warehouseService.getCurrentWarehouse().id) {
      this.productionJobMessage = 'Return to the original warehouse to continue this production transaction.';
      this.productionJobRetry = true;
      return;
    }
    this.productionJobRetry = false;
    this.productionJobMessage = 'Checking that this production transaction has created its inventory…';
    this.productionJobSubscription?.unsubscribe();
    try {
      this.productionJobSubscription = this.receiptService.waitForReceipt(job).subscribe({
        next: () => { void this.printConfirmedProduction(job); },
        error: () => {
          this.productionJobRetry = true;
          this.productionJobMessage = 'Inventory receipt is not yet confirmed. Continue checking the same transaction; do not submit it again.';
        }
      });
    } catch {
      this.productionJobMessage = 'Production receipt information is incomplete. Check the LPN before submitting again.';
    }
  }

  private async printConfirmedProduction(job: ProductionLabelJob): Promise<void> {
    try {
      for (const label of job.labels) {
        if (this.printedLpns.has(label.lpn)) continue;
        this.productionJobMessage = `Preparing label for ${label.lpn}…`;
        let report = this.labelReports.get(label.lpn);
        if (!report) {
          report = await firstValueFrom(this.workOrderService.generatePrePrintLPNLabel(
            job.workOrderId, label.lpn, label.quantity, job.productionLineName
          ).pipe(timeout(30000)));
          this.labelReports.set(label.lpn, report);
        }
        if (this.printAbort.signal.aborted) return;
        this.productionJobMessage = `Downloading and submitting label for ${label.lpn}…`;
        if (job.warehouseId !== this.warehouseService.getCurrentWarehouse().id) throw new Error('Warehouse changed.');
        await this.printingService.printReportHistoryFromLocalAsync(report, 2, this.printAbort.signal);
        this.printedLpns.add(label.lpn);
        this.persistPendingLabelJob();
      }
      this.pendingLabelJob = undefined;
      try { sessionStorage.removeItem(this.recoveryKey); } catch { /* Storage may be unavailable. */ }
      this.isProducing = false;
      this.productionJobMessage = 'Inventory receipt confirmed; labels submitted to the local printing service.';
      this.refresh();
    } catch {
      if (this.printAbort.signal.aborted) return;
      this.productionJobRetry = true;
      this.productionJobMessage = 'Inventory receipt confirmed, but label submission failed. Check the printer, then retry remaining labels without producing again.';
    }
  }

  private persistPendingLabelJob(): void {
    try { sessionStorage.setItem(this.recoveryKey, JSON.stringify({ job: this.pendingLabelJob, printed: [...this.printedLpns] })); }
    catch { /* The current page can still continue checking. */ }
  }

  private restorePendingLabelJob(): void {
    try {
      const pending = JSON.parse(sessionStorage.getItem(this.recoveryKey) ?? 'null');
      if (!pending?.job || pending.job.warehouseId !== this.warehouseService.getCurrentWarehouse().id) return;
      this.pendingLabelJob = pending.job;
      for (const lpn of pending.printed ?? []) this.printedLpns.add(lpn);
      this.isProducing = true;
      this.productionJobRetry = true;
      this.productionJobMessage = 'An earlier production transaction needs checking. Continue it without submitting production again.';
    } catch { /* No usable pending job. */ }
  }

  printNEWLPNLabelForWorkOrder(workOrderId: number, lpn: string, quantity?: number, productionLineName?: string, printerName?: string) {
    this.workOrderService.generatePrePrintLPNLabel(workOrderId, lpn, quantity, productionLineName, printerName).subscribe({
      next: reportHistory => {
        // print from default printer
        this.printingService.printReportHistoryFromLocal(reportHistory,
          undefined, undefined, 2
        );
      }
    });
  }

  refreshProductionLine(productionLine: ProductionLine): void {
    this.productionLineService.getProductionLine(productionLine.id!).subscribe({
      next: productionLineRes => {
        this.productionLines
          .filter(productionLine => productionLineRes.id! === productionLine.id!)
          .forEach(productionLine => {
            productionLine.assignedWorkOrders = productionLineRes.assignedWorkOrders;
            this.loadItemInformationForProductionLines([productionLine]);
          });
      }
    });
  }
}
