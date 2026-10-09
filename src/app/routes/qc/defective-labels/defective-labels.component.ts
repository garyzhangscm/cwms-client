import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { firstValueFrom } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { UserService } from '../../auth/services/user.service';
import { PrintingService } from '../../common/services/printing.service';
import { ReportHistory } from '../../report/models/report-history';
import { ReportType } from '../../report/models/report-type.enum';

@Component({selector: 'app-qc-defective-labels', standalone: false,
  templateUrl: './defective-labels.component.html', styleUrls: ['./defective-labels.component.less']})
export class QcDefectiveLabelsComponent implements OnInit {
  count = 20;
  busy = false;
  error = '';
  notice = '';
  lpns: string[] = [];
  histories: ReportHistory[] = [];
  selected?: ReportHistory;
  historyLoading = false;
  hasMore = false;
  batchSearch = '';
  private activeSearch = '';
  labelCount = 0;
  fromLabel = 1;
  toLabel = 1;
  private selectionVersion = 0;
  private warehouseId = 0;
  private storageKey = '';
  constructor(private http: _HttpClient, private warehouse: WarehouseService,
    private user: UserService, private printing: PrintingService, private message: NzMessageService) {}

  ngOnInit(): void {
    this.warehouseId = this.warehouse.getCurrentWarehouse().id;
    this.storageKey = `qc-defective-labels:${this.warehouseId}:${this.user.getCurrentUsername()}`;
    try {
      const saved = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
      if (Array.isArray(saved) && saved.every(x => typeof x === 'string')) {
        if (saved.length && !saved.every(x => /^DE[0-9]{10}$/.test(x))) {
          // Retain old pending numbers for reconciliation; never relabel them as DE.
          sessionStorage.setItem(`${this.storageKey}:legacy:${Date.now()}`, JSON.stringify(saved));
          sessionStorage.removeItem(this.storageKey);
          this.notice = 'An older pending batch was set aside in this browser. Check Label History before reprinting it. New batches use DE numbers.';
        } else this.lpns = saved;
      }
    } catch { this.error = 'Could not restore the pending batch. Check Report History before generating another batch.'; }
    void this.refreshHistory();
  }
  async refreshHistory(more = false): Promise<void> {
    if (this.historyLoading) return;
    if (this.warehouse.getCurrentWarehouse().id !== this.warehouseId) {
      this.error = 'Warehouse changed. Reload this page.'; return;
    }
    this.historyLoading = true;
    if (!more) this.activeSearch = this.batchSearch.trim();
    try {
      const params: any = {warehouseId: this.warehouseId, batch: this.activeSearch};
      if (more && this.histories.length) params.beforeId = this.histories[this.histories.length - 1].id;
      const result = await firstValueFrom(this.http.get('resource/defective-labels', params));
      const items: ReportHistory[] = result.data.items;
      this.histories = more ? [...this.histories, ...items.filter(row => !this.histories.some(old => old.id === row.id))] : items;
      this.hasMore = result.data.hasMore;
    } catch { this.error = 'Could not load label history. Refresh before reprinting.'; }
    finally { this.historyLoading = false; }
  }
  batchName(row: ReportHistory): string {
    return row.description?.startsWith('QC-') ? row.description.split(' | ')[0] : `Legacy #${row.id}`;
  }
  batchCount(row: ReportHistory): string {
    return row.description?.startsWith('QC-') ? row.description.split(' | ')[1] || '—' : '—';
  }
  get validRange(): boolean {
    return Number.isInteger(this.fromLabel) && Number.isInteger(this.toLabel) &&
      this.fromLabel >= 1 && this.toLabel >= this.fromLabel && this.toLabel <= this.labelCount;
  }
  async generate(): Promise<void> {
    if (this.busy || !Number.isInteger(this.count) || this.count < 1 || this.count > 100) return;
    if (this.warehouse.getCurrentWarehouse().id !== this.warehouseId) {
      this.error = 'Warehouse changed. Reload this page before continuing.'; return;
    }
    this.busy = true; this.error = ''; this.selected = undefined; this.labelCount = 0; ++this.selectionVersion;
    try {
      // Verify the dedicated report type exists before consuming numbers.
      const templates = await firstValueFrom(this.http.get('resource/reports', {type: ReportType.DEFECTIVE_LPN_LABEL}));
      const companyId = this.warehouse.getCurrentWarehouse().companyId;
      if (!templates.data?.some((r: any) => (!r.warehouseId || r.warehouseId === this.warehouseId) &&
        (!r.companyId || r.companyId === companyId))) throw new Error('REPORT_NOT_CONFIGURED');
      if (!this.lpns.length) {
        const configuration = await firstValueFrom(this.http.get('common/system-controlled-numbers', {
          warehouseId: this.warehouseId, variable: 'defective-label-number'
        }));
        if (!Array.isArray(configuration.data) || configuration.data.length !== 1 ||
            configuration.data[0].prefix !== 'DE' || configuration.data[0].length !== 10 ||
            (configuration.data[0].postfix || '') !== '' || configuration.data[0].rollover !== false) {
          throw new Error('DE_NUMBER_NOT_CONFIGURED');
        }
        const result = await firstValueFrom(this.http.get('common/system-controlled-number/defective-label-number/batch/next', {
          warehouseId: this.warehouseId, batch: this.count
        }));
        // Preserve allocated numbers before any report-generation request; retries reuse these numbers.
        this.lpns = result.data;
        sessionStorage.setItem(this.storageKey, JSON.stringify(this.lpns));
      }
      if (!Array.isArray(this.lpns) || !this.lpns.length || new Set(this.lpns).size !== this.lpns.length ||
          !this.lpns.every(lpn => /^DE[0-9]{10}$/.test(lpn))) {
        throw new Error('INVALID_NUMBERS');
      }
      const result = await firstValueFrom(this.http.post(
        `resource/defective-labels/${this.warehouseId}/generate`, this.lpns));
      this.selected = result.data;
      this.labelCount = this.lpns.length; this.fromLabel = 1; this.toLabel = this.labelCount;
      this.lpns = []; sessionStorage.removeItem(this.storageKey);
      await this.refreshHistory();
      this.message.success('Labels generated. Select Print to send this batch to a printer.');
    } catch (e) {
      this.error = e instanceof Error && e.message === 'REPORT_NOT_CONFIGURED'
        ? 'Defective LPN Label is not configured in Reports for this warehouse.'
        : e instanceof Error && e.message === 'DE_NUMBER_NOT_CONFIGURED'
        ? 'Configure defective-label-number for this warehouse with prefix DE, 10 digits, no suffix and no rollover before generating labels.'
        : 'Generation did not complete. Any received LPNs are retained for retry. Check Report History if the request timed out; do not print two files containing the same LPNs.';
    } finally { this.busy = false; }
  }
  async select(history: ReportHistory): Promise<void> {
    if (this.busy) return;
    const version = ++this.selectionVersion;
    this.selected = history; this.labelCount = 0; this.error = '';
    try {
      const result = await firstValueFrom(this.http.get(`resource/defective-labels/${history.id}/details`, {warehouseId: this.warehouseId}));
      if (version !== this.selectionVersion) return;
      this.labelCount = result.data.count; this.fromLabel = 1; this.toLabel = this.labelCount;
    } catch { if (version === this.selectionVersion) this.error = 'Could not read this label batch. Please select it again.'; }
  }
  async print(event: {printerIndex: number; printerName: string; physicalCopyCount: number; collated: boolean}): Promise<void> {
    if (!this.selected || this.busy || !this.validRange) return;
    if (this.warehouse.getCurrentWarehouse().id !== this.warehouseId) {
      this.error = 'Warehouse changed. Reload this page.'; return;
    }
    this.busy = true; this.error = '';
    try {
      const selected = this.selected;
      const result = await firstValueFrom(this.http.post(`resource/defective-labels/${selected.id}/range`, {}, {
        warehouseId: this.warehouseId, from: this.fromLabel, to: this.toLabel
      }));
      const printable = {...selected, fileName: result.data.fileName};
      this.printing.printFileByName('Defective LPN Labels', printable.fileName,
        ReportType.DEFECTIVE_LPN_LABEL, event.printerIndex, event.printerName, 1,
        undefined, undefined, undefined, printable, event.collated);
    } catch { this.error = 'Could not prepare the selected range. No print request was sent.'; }
    finally { this.busy = false; }
  }
}
