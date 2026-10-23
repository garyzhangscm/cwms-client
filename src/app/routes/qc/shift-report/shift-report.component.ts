import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { I18NService } from '@core';
import { Subscription, timeout } from 'rxjs';
import { saveAs } from 'file-saver';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcShiftReport, QcShiftSchedule, QcShiftRow, QcShiftInspection, validateShiftReport, validateShiftConfiguration } from './shift-report.model';

@Component({selector: 'app-qc-shift-report', standalone: false,
  templateUrl: './shift-report.component.html', styleUrls: ['./shift-report.component.less']})
export class QcShiftReportComponent implements OnDestroy, OnInit {
  private readonly api = inject(_HttpClient);
  private readonly rawHttp = inject(HttpClient);
  private readonly warehouse = inject(WarehouseService);
  readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  mode: 'shift' | 'custom' = 'shift';
  startLocal = '';
  endLocal = '';
  private reportRangeKey = '';
  date = '';
  shift = '';
  shifts: QcShiftSchedule[] = [];
  loadingShifts = false;
  private configWarehouse?: number;
  private configQuery?: Subscription;
  report?: QcShiftReport;
  busy = false;
  exporting = false;
  exportFormat: 'xlsx' | 'pdf' = 'xlsx';
  error = '';
  readonly inspectionKinds: ('firstSample' | 'inline')[] = ['firstSample', 'inline'];
  selectedRow?: QcShiftRow;
  selectedKind: 'firstSample' | 'inline' = 'inline';
  private version = 0;
  private query?: Subscription;
  private download?: Subscription;
  timezone = '';

  constructor() {
    inject(TitleService).setTitle(this.i18n.fanyi('qc-shift.title'));
  }
  ngOnInit(): void { this.loadShifts(); }
  loadShifts(): void {
    this.clear(); this.configQuery?.unsubscribe();
    this.shifts = []; this.shift = ''; this.configWarehouse = undefined; this.loadingShifts = true;
    const warehouse = this.warehouse.getCurrentWarehouse();
    this.configQuery = this.api.get('qc-shift-report/shifts', {warehouseId: warehouse.id,
      companyId: warehouse.companyId}).pipe(timeout(30000)).subscribe({
      next: response => {
        this.loadingShifts = false;
        if (warehouse.id !== this.warehouse.getCurrentWarehouse()?.id) return;
        try {
          const config = validateShiftConfiguration(response.data, warehouse.id);
          this.shifts = config.shifts; this.timezone = config.timezone;
          if (!this.date) {
            const parts = new Intl.DateTimeFormat('en-US', {timeZone: config.timezone, year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(new Date());
            this.date = ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
          }
          this.shift = config.shifts[0].id; this.configWarehouse = warehouse.id;
          this.initializeRange();
        } catch { this.error = this.t('config-failed'); }
      },
      error: () => { this.loadingShifts = false; this.error = this.t('config-failed'); }
    });
  }
  initializeRange(): void {
    this.clear();
    if (this.mode !== 'custom') return;
    if (this.startLocal && this.endLocal) return;
    const schedule = this.shifts.find(s => s.id === this.shift);
    if (!schedule || !this.date) return;
    const end = new Date(this.date + 'T00:00:00Z');
    end.setUTCDate(end.getUTCDate() + Number(schedule.nextDay));
    this.startLocal = `${this.date}T${schedule.start}`;
    this.endLocal = `${end.toISOString().slice(0, 10)}T${schedule.end}`;
  }
  periodLabel(report: QcShiftReport): string {
    const format = new Intl.DateTimeFormat(this.i18n.currentLang, {timeZone: report.timezone, dateStyle: 'short', timeStyle: 'medium'});
    return `${format.format(new Date(report.startTime))} – ${format.format(new Date(report.endTime))}`;
  }
  shiftLabel(schedule: QcShiftSchedule): string {
    return `${schedule.start}–${schedule.end}${schedule.nextDay ? ' · ' + this.t('next-day') : ''}`;
  }
  t(key: string): string { return this.i18n.fanyi(`qc-shift.${key}`); }
  generatedAt(report: QcShiftReport): string {
    return new Intl.DateTimeFormat(this.i18n.currentLang, {timeZone: report.timezone, dateStyle: 'short', timeStyle: 'medium'})
      .format(new Date(report.generatedAt));
  }
  personName(entry: QcShiftInspection): string { return entry.displayName || entry.username || this.t('not-recorded'); }
  people(entries: QcShiftInspection[]): string[] {
    const groups = new Map<string, {name: string; count: number}>();
    for (const entry of entries) {
      const key = entry.username?.toLowerCase() || '';
      const group = groups.get(key) || {name: this.personName(entry), count: 0};
      ++group.count; groups.set(key, group);
    }
    return [...groups.values()].map(p => `${p.name} (${p.count})`);
  }
  toggleDetails(row: QcShiftRow, kind: 'firstSample' | 'inline'): void {
    if (!this.current || !row[kind] || !this.report?.rows.includes(row)) return;
    this.selectedRow = this.selectedRow === row && this.selectedKind === kind ? undefined : row;
    this.selectedKind = kind;
  }
  inspectionTime(entry: QcShiftInspection): string {
    return new Intl.DateTimeFormat(this.i18n.currentLang, {timeZone: this.report!.timezone, dateStyle: 'short', timeStyle: 'medium'})
      .format(new Date(entry.timestamp));
  }
  get current(): boolean {
    return !!this.report && this.report.warehouseId === this.warehouse.getCurrentWarehouse()?.id &&
      (this.mode === 'custom' ? this.report.shift === 'custom' && this.reportRangeKey === `${this.startLocal}|${this.endLocal}` :
        this.report.date === this.date && this.report.shift === this.shift);
  }
  clear(): void {
    ++this.version; this.query?.unsubscribe(); this.download?.unsubscribe();
    this.report = undefined; this.busy = false; this.exporting = false; this.error = '';
    this.selectedRow = undefined;
  }
  search(): void {
    this.clear();
    if (this.mode === 'shift' && !/^\d{4}-\d{2}-\d{2}$/.test(this.date)) { this.error = this.t('invalid-date'); return; }
    const version = this.version;
    const warehouse = this.warehouse.getCurrentWarehouse();
    if (this.configWarehouse !== warehouse.id) { this.loadShifts(); return; }
    if (this.mode === 'custom' && (!this.startLocal || !this.endLocal || this.endLocal <= this.startLocal)) { this.error = this.t('invalid-range'); return; }
    if (this.mode === 'shift' && !this.shifts.some(s => s.id === this.shift)) { this.error = this.t('config-failed'); return; }
    const custom = this.mode === 'custom';
    const date = custom ? this.startLocal.slice(0, 10) : this.date, shift = custom ? 'custom' : this.shift;
    const range = custom ? {start: this.startLocal, end: this.endLocal} : undefined;
    const parameters = custom ? {startLocal: this.startLocal, endLocal: this.endLocal} : {date, shift};
    this.busy = true;
    this.query = this.api.get('qc-shift-report/report', {warehouseId: warehouse.id,
      companyId: warehouse.companyId, ...parameters}).pipe(timeout(60000)).subscribe({
      next: response => {
        if (version !== this.version || warehouse.id !== this.warehouse.getCurrentWarehouse()?.id) {
          if (version === this.version) this.clear(); return;
        }
        try {
          this.report = validateShiftReport(response.data, warehouse.id, date, shift, range);
          this.reportRangeKey = range ? `${range.start}|${range.end}` : '';
        }
        catch { this.error = this.t('failed'); }
        this.busy = false;
      },
      error: (failure: {error?: {message?: unknown}}) => {
        if (version === this.version) {
          const reason = failure?.error?.message;
          this.error = this.t('failed') + (typeof reason === 'string' && reason.length <= 300 ? ` ${reason}` : '');
          this.busy = false;
        }
      }
    });
  }
  export(format: 'xlsx' | 'pdf' = 'xlsx'): void {
    if (!this.current || !this.report || this.exporting) return;
    const report = this.report, version = this.version;
    this.exporting = true; this.exportFormat = format; this.error = '';
    // Export exactly the displayed server snapshot; changing data cannot make the file disagree with the page.
    this.download = this.rawHttp.post(format === 'pdf' ? 'qc-shift-report/export-pdf' : 'qc-shift-report/export', {snapshotId: report.snapshotId,
      warehouseId: report.warehouseId, companyId: this.warehouse.getCurrentWarehouse().companyId}, {responseType: 'blob'}).pipe(timeout(30000)).subscribe({
      next: file => {
        if (version !== this.version || !this.current) { this.exporting = false; return; }
        saveAs(file, `QC_${report.date}_${report.shift.toLowerCase()}_shift.${format}`); this.exporting = false;
      },
      error: () => { if (version === this.version) { this.error = this.t('export-failed'); this.exporting = false; } }
    });
  }
  ngOnDestroy(): void { this.clear(); this.configQuery?.unsubscribe(); }
}
