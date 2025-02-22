import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { AuditCountResult } from '../models/audit-count-result';
import { AuditCountResultService } from '../services/audit-count-result.service';

@Component({
    selector: 'app-inventory-audit-count-confirm',
    templateUrl: './audit-count-confirm.component.html',
    standalone: false
})
export class InventoryAuditCountConfirmComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfAllAuditCountResult: AuditCountResult[] = [];
  listOfDisplayAuditCountResult: AuditCountResult[] = [];

  batchId = '';
  locationId!: number;

  pageTitle: string;
  constructor(
    private activatedRoute: ActivatedRoute, 
    private titleService: TitleService,
    private auditCountResultService: AuditCountResultService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.inventory.audit-count-confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.inventory.cycle-count-confirm.title'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['batchId'] && params['locationId']) {
        this.batchId = params['batchId'];
        this.locationId = params['locationId'];
      }
    });

    this.listOfAllAuditCountResult = JSON.parse(sessionStorage.getItem('currentAuditCountResults')!);
    this.listOfDisplayAuditCountResult = JSON.parse(sessionStorage.getItem('currentAuditCountResults')!);
  }

  inventoryTableCurrentPageDataChange($event: AuditCountResult[]): void {
    this.listOfDisplayAuditCountResult = $event;
  }

  confirmResult(): void {
    this.auditCountResultService
      .saveAuditCountResultDetails(this.batchId, this.locationId, this.listOfAllAuditCountResult)
      .subscribe(savedAuditCountResults => {
        this.router.navigateByUrl(`/inventory/count/cycle-count-maintenance?batchId=${this.batchId}&from=auditConfirm`);
      });
  }
}
