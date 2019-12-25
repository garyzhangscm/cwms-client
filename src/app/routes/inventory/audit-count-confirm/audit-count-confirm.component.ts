import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { AuditCountResult } from '../models/audit-count-result';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { InventoryStatus } from '../models/inventory-status';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { AuditCountResultService } from '../services/audit-count-result.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { InventoryStatusService } from '../services/inventory-status.service';
import { ItemService } from '../services/item.service';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory-audit-count-confirm',
  templateUrl: './audit-count-confirm.component.html',
})
export class InventoryAuditCountConfirmComponent implements OnInit {
  listOfAllAuditCountResult: AuditCountResult[] = [];
  listOfDisplayAuditCountResult: AuditCountResult[] = [];

  batchId: string;
  locationId: number;

  pageTitle: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private auditCountResultService: AuditCountResultService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.audit-count-confirm.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.cycle-count-confirm.title'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.batchId && params.locationId) {
        this.batchId = params.batchId;
        this.locationId = params.locationId;
      }
    });

    this.listOfAllAuditCountResult = JSON.parse(sessionStorage.getItem('currentAuditCountResults'));
    this.listOfDisplayAuditCountResult = JSON.parse(sessionStorage.getItem('currentAuditCountResults'));
  }

  inventoryTableCurrentPageDataChange($event: AuditCountResult[]): void {
    this.listOfDisplayAuditCountResult = $event;
  }

  confirmResult() {
    this.auditCountResultService
      .saveAuditCountResultDetails(this.batchId, this.locationId, this.listOfAllAuditCountResult)
      .subscribe(savedAuditCountResults => {
        this.router.navigateByUrl(`/inventory/count/cycle-count-maintenance?batchId=${this.batchId}`);
      });
  }
}
