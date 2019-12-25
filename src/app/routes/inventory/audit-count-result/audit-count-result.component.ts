import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { AuditCountResult } from '../models/audit-count-result';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { AuditCountResultService } from '../services/audit-count-result.service';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { InventoryStatus } from '../models/inventory-status';
import { InventoryStatusService } from '../services/inventory-status.service';
import { ItemService } from '../services/item.service';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-audit-count-result',
  templateUrl: './audit-count-result.component.html',
})
export class InventoryAuditCountResultComponent implements OnInit {
  listOfAllAuditCountResult: AuditCountResult[] = [];
  listOfDisplayAuditCountResult: AuditCountResult[] = [];

  batchId: string;
  location: WarehouseLocation;

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
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.audit-count-result.title');
  }

  ngOnInit() {
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

  loadAvailableInventoryStatus() {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  inventoryTableCurrentPageDataChange($event: AuditCountResult[]): void {
    this.listOfDisplayAuditCountResult = $event;
  }

  addExtraInventory() {
    this.listOfAllAuditCountResult = [...this.listOfAllAuditCountResult, this.getEmptyAuditCountResult()];
  }

  lpnChanged(lpn: string, auditCountResult: AuditCountResult) {
    auditCountResult.inventory.lpn = lpn;
  }

  generateLPN(checked: boolean, index: number, auditCountResult: AuditCountResult) {
    if (checked) {
      this.inventoryService.getNextLPN().subscribe(nextId => {
        auditCountResult.inventory.lpn = nextId;
      });
    }
  }

  itemChanged(itemName: string, auditCountResult: AuditCountResult) {
    // load the item information
    this.itemService.getItems(itemName).subscribe(items => {
      // since item name is a nature key, we should only have one record returned(or nothing)
      if (items.length > 0) {
        auditCountResult.inventory.item = items[0];
      }
    });
  }

  itemPackageTypeChanged(itemPackageTypeName: string, auditCountResult: AuditCountResult) {
    // we should alraedy load the item information
    if (auditCountResult.inventory.item && auditCountResult.inventory.item.itemPackageTypes) {
      auditCountResult.inventory.item.itemPackageTypes
        .filter(itemPackageType => itemPackageType.name === itemPackageTypeName)
        .forEach(itemPackageType => (auditCountResult.inventory.itemPackageType = itemPackageType));
    }
  }

  inventoryStatusChanged(inventoryStatusId: number, auditCountResult: AuditCountResult) {
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id === inventoryStatusId)
      .forEach(inventoryStatus => (auditCountResult.inventory.inventoryStatus = inventoryStatus));
  }

  saveCurrentAuditCountResults() {
    sessionStorage.setItem('currentAuditCountResults', JSON.stringify(this.listOfAllAuditCountResult));
  }

  getEmptyAuditCountResult(): AuditCountResult {
    return {
      id: null,
      batchId: this.batchId,
      location: this.location,
      inventory: {
        id: null,
        lpn: '',
        location: this.location,
        item: {
          id: null,
          name: '',
          description: '',
          itemPackageTypes: [
            {
              id: null,
              name: '',
              itemUnitOfMeasures: null,
            },
          ],
        },
        itemPackageType: {
          id: null,
          name: '',
          itemUnitOfMeasures: null,
        },
        quantity: 0,
        inventoryStatus: {
          id: null,
          name: '',
          description: '',
        },
      },
      quantity: 0,
      countQuantity: 0,
    };
  }
}
