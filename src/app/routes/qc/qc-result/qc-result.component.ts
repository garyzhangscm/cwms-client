import { formatDate } from '@angular/common';
import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN } from '@delon/theme';
import { Subscription, timeout } from 'rxjs';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';
import { presentQcRecord, QcResultRecord } from './qc-result.presentation';

@Component({
  selector: 'app-qc-qc-result',
  templateUrl: './qc-result.component.html',
  styleUrls: ['./qc-result.component.less'],
  standalone: false
})
export class QcQcResultComponent implements OnInit, OnDestroy {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(QcInspectionRequestService);
  private readonly warehouse = inject(WarehouseService);
  private readonly destroyRef = inject(DestroyRef);
  private subscription?: Subscription;
  private searchVersion = 0;
  get isSandbox(): boolean { return this.route.snapshot.data['qcSandbox'] === true; }
  listOfQCInspectionRequest: QcResultRecord[] = [];
  searchResult = '';
  searchFailed = false;
  isSpinning = false;
  searchForm = this.fb.group({ lpn: [null], workOrderQCSampleNumber: [null], number: [null] });

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      if (this.route.snapshot.data['qcSandbox'] === true && params['number']) {
        this.searchForm.patchValue({ number: params['number'] });
        this.search();
      } else if (params['lpn']) {
        this.searchForm.patchValue({ lpn: params['lpn'] });
        this.search();
      }
    });
  }
  ngOnDestroy(): void { ++this.searchVersion; this.subscription?.unsubscribe(); }
  resetForm(): void {
    ++this.searchVersion;
    this.subscription?.unsubscribe();
    this.searchForm.reset();
    this.listOfQCInspectionRequest = [];
    this.searchResult = '';
    this.searchFailed = this.isSpinning = false;
  }
  search(): void {
    const version = ++this.searchVersion;
    const warehouseId = this.warehouse.getCurrentWarehouse().id;
    const current = () => version === this.searchVersion && warehouseId === this.warehouse.getCurrentWarehouse().id;
    this.subscription?.unsubscribe();
    this.isSpinning = true;
    this.searchFailed = false;
    this.searchResult = '';
    const values = this.searchForm.getRawValue();
    this.subscription = this.service.getQCInspectionResult(values.lpn, values.workOrderQCSampleNumber, values.number, this.route.snapshot.data['qcSandbox'] === true)
      .pipe(timeout(30000)).subscribe({
        next: records => {
          if (!current()) { if (version === this.searchVersion) this.isSpinning = false; return; }
          this.listOfQCInspectionRequest = (records ?? []).map(record => presentQcRecord(record, key => this.i18n.fanyi(key), this.i18n.currentLang));
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'), rowCount: records?.length ?? 0
          });
        },
        error: () => {
          if (version !== this.searchVersion) return;
          this.listOfQCInspectionRequest = [];
          this.isSpinning = false;
          this.searchFailed = true;
        }
      });
  }
  columns: STColumn[] = [
    { title: this.i18n.fanyi('qc-view.record'), index: 'number', width: 170 },
    { title: this.i18n.fanyi('item'), render: 'material', width: 240 },
    { title: this.i18n.fanyi('qc-view.context'), render: 'context', width: 240 },
    { title: this.i18n.fanyi('qc-result'), render: 'decision', width: 170 },
    { title: this.i18n.fanyi('qc-inspection-time'), render: 'time', width: 170 },
    { title: this.i18n.fanyi('username'), index: 'qcUsername', default: '—', width: 130 }
  ];
  inventoryColumns: STColumn[] = [
    { title: this.i18n.fanyi('lpn'), index: 'lpn', default: '—' },
    { title: this.i18n.fanyi('item'), index: 'item.name', default: '—' },
    { title: this.i18n.fanyi('item.description'), index: 'item.description', default: '—' },
    { title: this.i18n.fanyi('quantity'), index: 'quantity' },
    { title: this.i18n.fanyi('status'), index: 'inventoryStatus.name', default: '—' }
  ];
}
