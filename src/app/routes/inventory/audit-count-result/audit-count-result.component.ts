import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AuditCountResult } from '../models/audit-count-result';
import { InventoryStatus } from '../models/inventory-status';
import { AuditCountResultService } from '../services/audit-count-result.service';
import { InventoryStatusService } from '../services/inventory-status.service';
import { InventoryService } from '../services/inventory.service';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-inventory-audit-count-result',
  templateUrl: './audit-count-result.component.html',
})
export class InventoryAuditCountResultComponent implements OnInit {
  listOfAllAuditCountResult: AuditCountResult[] = [];
  listOfDisplayAuditCountResult: AuditCountResult[] = [];

  batchId: string | undefined;
  location: WarehouseLocation | undefined;
  warehouseId: number | undefined; 

  validInventoryStatuses: InventoryStatus[] = [];

  pageTitle: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private auditCountResultService: AuditCountResultService,
    private locationService: LocationService,
    private inventoryStatusService: InventoryStatusService,
    private itemService: ItemService,
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.audit-count-result.title');
    
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.cycle-count-request.title'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.batchId && params.locationId) {
        this.batchId = params.batchId;
        
        this.locationService.getLocation(params.locationId).subscribe(location => (this.location = location));

        this.auditCountResultService
          .getEmptyAuditCountResultDetails(params.batchId, params.locationId)
          .subscribe(emptyAuditCountResults => {
            emptyAuditCountResults = emptyAuditCountResults.map(auditCountResult => {
              if (auditCountResult.inventory === null) {
                return this.getEmptyAuditCountResult();
              } else {
                return auditCountResult;
              }
            });

            this.listOfAllAuditCountResult = emptyAuditCountResults;
            this.listOfDisplayAuditCountResult = emptyAuditCountResults;
          });
      }
    });
    this.loadAvailableInventoryStatus();
  }

  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  inventoryTableCurrentPageDataChange($event: AuditCountResult[]): void {
    this.listOfDisplayAuditCountResult = $event;
  }

  addExtraInventory(): void {
    this.listOfAllAuditCountResult = [...this.listOfAllAuditCountResult, this.getEmptyAuditCountResult()];
  }

  lpnChanged(lpn: string, auditCountResult: AuditCountResult): void {
    auditCountResult.inventory.lpn = lpn;
    auditCountResult.lpn = lpn;
  }

  generateLPN(checked: boolean, index: number, auditCountResult: AuditCountResult): void {
    if (checked) {
      this.inventoryService.getNextLPN().subscribe(nextId => {
        auditCountResult.inventory.lpn = nextId;
      });
    }
  }

  itemChanged(itemName: string, auditCountResult: AuditCountResult): void {
    // load the item information
    this.itemService.getItems(itemName).subscribe(items => {
      // since item name is a nature key, we should only have one record returned(or nothing)
      if (items.length > 0) {
        auditCountResult.inventory.item = items[0];
        auditCountResult.item = items[0];
      }
    });
  }

  itemPackageTypeChanged(itemPackageTypeName: string, auditCountResult: AuditCountResult): void {
    // we should alraedy load the item information
    if (auditCountResult.inventory.item && auditCountResult.inventory.item.itemPackageTypes) {
      auditCountResult.inventory.item.itemPackageTypes
        .filter(itemPackageType => itemPackageType.name === itemPackageTypeName)
        .forEach(itemPackageType => (auditCountResult.inventory.itemPackageType = itemPackageType));
    }
  }

  inventoryStatusChanged(inventoryStatusId: number, auditCountResult: AuditCountResult): void {
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id === inventoryStatusId)
      .forEach(inventoryStatus => (auditCountResult.inventory.inventoryStatus = inventoryStatus));
  }

  saveCurrentAuditCountResults(): void {
    sessionStorage.setItem('currentAuditCountResults', JSON.stringify(this.listOfAllAuditCountResult));
  }

  getEmptyAuditCountResult(): AuditCountResult {
    return {
      id: undefined,
      batchId: this.batchId!,
      location: this.location!,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      inventory: {
        id: undefined,
        lpn: '',
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        location: this.location!,
        virtual: false, // default to NON virtual inventory. It make no sense to adjust virtual inventory
        item: {
          id: undefined,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          name: '',
          description: '',
          allowCartonization: undefined,
          itemPackageTypes: [
            {
              id: undefined,
              warehouseId: this.warehouseService.getCurrentWarehouse().id,
              description: '',
              name: '',
              itemUnitOfMeasures: [],
            },
          ],

          client: undefined,
          itemFamily: undefined,
          unitCost: undefined,

          allowAllocationByLPN: undefined,
          allocationRoundUpStrategyType: undefined,

          allocationRoundUpStrategyValue: undefined,

          trackingVolumeFlag: undefined,
          trackingLotNumberFlag: undefined,
          trackingManufactureDateFlag: undefined,
          shelfLifeDays: undefined,
          trackingExpirationDateFlag: undefined,
        },
        itemPackageType: {
          description: '',
          id: undefined,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          name: '',
          itemUnitOfMeasures: [],
        },
        quantity: 0,
        inventoryStatus: {
          id: undefined,
          name: '',
          description: '',
        },
      },
      quantity: 0,
      countQuantity: 0,
      lpn: '',
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
        allowCartonization: undefined,
        itemPackageTypes: [
          {
            id: undefined,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            description: '',
            name: '',
            itemUnitOfMeasures: [],
          },
        ],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
    };
  }
}
