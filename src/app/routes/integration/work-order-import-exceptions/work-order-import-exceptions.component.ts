import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from '../../auth/services/user.service';

interface Adjustment { sourceRow: number; field: string; originalQuantity: string; roundedQuantity: number; difference: string; }
interface ImportRow { file: string; workOrderNumber: string; state: string; validationError?: string; mesError?: string; missingItems?: string[]; quantityAdjustments?: Adjustment[]; checkedAt: number; integrationId?: string; }
interface Job { id: string; file: string; workOrderNumber: string; action: string; actor: string; state: string; createdAt: number; updatedAt: number; error?: string; waitingReason?: string; results?: ImportRow[]; }
interface Response<T> { result: number; message: string; data: T; }
interface Listing { rows: ImportRow[]; total: number; truncated: boolean; canRetry: boolean; }
interface Detail { report: { records?: ImportRow[]; state?: string; reason?: string; sourceCleanup?: string }; converted: { workOrderNumber: string; quantityAdjustments: Adjustment[]; payload: { expectedQuantity: number; itemName: string } }[]; originalRows: Record<string, string>[]; history: Job[]; }

@Component({selector: 'app-work-order-import-exceptions', standalone: false,
  templateUrl: './work-order-import-exceptions.component.html', styleUrls: ['./work-order-import-exceptions.component.less']})
export class WorkOrderImportExceptionsComponent implements OnInit, OnDestroy {
  rows: ImportRow[] = []; jobs: Job[] = []; batch = ''; number = ''; state = '';
  loading = false; submitting = false; canRetry = false; error = ''; jobError = ''; truncated = false;
  detail?: Detail; selected?: ImportRow; detailVisible = false; detailLoading = false;
  private readonly destroyed = new Subject<void>();
  private refresh?: ReturnType<typeof setInterval>;
  private polling = false;
  readonly states = ['BLOCKED', 'BUSINESS_ERROR', 'UNCERTAIN', 'REJECTED'];
  constructor(private http: HttpClient, private users: UserService, private messages: NzMessageService, private modal: NzModalService) {}
  ngOnInit(): void { this.load(); this.loadJobs(); this.refresh = setInterval(() => this.loadJobs(), 5000); }
  ngOnDestroy(): void { if (this.refresh) clearInterval(this.refresh); this.destroyed.next(); this.destroyed.complete(); }
  private headers(): HttpHeaders { return new HttpHeaders({'X-CWMS-Username': this.users.getCurrentUsername()}); }
  label(state: string): string { return ({PREPARED: 'Ready to import', BLOCKED: 'Needs attention', ACCEPTED: 'Processing in MES', BUSINESS_ERROR: 'MES error', UNCERTAIN: 'Verify previous request', COMPLETED: 'Completed', SKIPPED_EXISTING: 'Already exists', REJECTED: 'Batch rejected', NO_NEW_WORK_ORDERS: 'No changes', NOT_CHECKED: 'Not checked'} as Record<string, string>)[state] || state; }
  load(): void {
    if (this.loading) return;
    this.loading = true; this.error = '';
    const params = new HttpParams().set('batch', this.batch.trim()).set('number', this.number.trim()).set('state', this.state);
    this.http.get<Response<Listing>>('work-order-import/batches', {headers: this.headers(), params}).pipe(takeUntil(this.destroyed)).subscribe({
      next: res => { this.rows = res.data.rows; this.canRetry = res.data.canRetry; this.truncated = res.data.truncated; this.loading = false; },
      error: err => { this.error = err.error?.message || 'Unable to load import exceptions'; this.canRetry = false; this.loading = false; }
    });
  }
  loadJobs(): void {
    if (this.polling) return;
    this.polling = true;
    this.http.get<Response<Job[]>>('work-order-import/jobs', {headers: this.headers()}).pipe(takeUntil(this.destroyed)).subscribe({
      next: res => {
        const changed = this.jobs.some(old => ['QUEUED', 'RUNNING'].includes(old.state) && res.data.some(job => job.id === old.id && job.state !== old.state));
        this.jobs = res.data; this.polling = false; this.jobError = '';
        if (changed || this.rows.some(row => row.state === 'ACCEPTED')) { this.load(); if (this.detailVisible && this.selected) this.showDetail(this.selected); }
      },
      error: () => { this.polling = false; this.jobError = 'Unable to refresh action results. Please refresh or check your connection.'; }
    });
  }
  showDetail(row: ImportRow): void {
    this.selected = row; this.detailVisible = true; this.detailLoading = true; this.detail = undefined;
    const params = new HttpParams().set('file', row.file).set('number', row.workOrderNumber || '');
    this.http.get<Response<Detail>>('work-order-import/batch', {headers: this.headers(), params}).pipe(takeUntil(this.destroyed)).subscribe({
      next: res => { if (this.selected?.file !== row.file || this.selected?.workOrderNumber !== row.workOrderNumber) return; this.detail = res.data; this.detailLoading = false; },
      error: err => { this.messages.error(err.error?.message || 'Unable to load batch details'); this.detailLoading = false; }
    });
  }
  jobSummary(job: Job): string {
    const counts: Record<string, number> = {};
    for (const result of job.results || []) counts[result.state] = (counts[result.state] || 0) + 1;
    return Object.entries(counts).map(([state, count]) => `${count} ${this.label(state)}`).join(' · ');
  }
  busy(row: ImportRow): boolean { return this.jobs.some(job => ['QUEUED', 'RUNNING'].includes(job.state) && job.file === row.file && (!job.workOrderNumber || !row.workOrderNumber || job.workOrderNumber === row.workOrderNumber)); }
  retryable(row: ImportRow): boolean { return !!row.workOrderNumber && ['PREPARED', 'BLOCKED', 'BUSINESS_ERROR'].includes(row.state); }
  act(row: ImportRow, action: 'check' | 'retry', batch = false): void {
    if (!this.canRetry || this.submitting || this.busy(row)) return;
    const submit = (): void => {
      this.submitting = true;
      this.http.post<Response<Job>>('work-order-import/actions', {file: row.file, workOrderNumber: batch ? '' : row.workOrderNumber || '', action}, {headers: this.headers()}).pipe(takeUntil(this.destroyed)).subscribe({
        next: res => { this.jobs = [res.data, ...this.jobs]; this.submitting = false; this.messages.info('Action queued. Results will refresh automatically.'); },
        error: err => { this.submitting = false; this.messages.error(err.error?.message || 'Unable to queue this action'); }
      });
    };
    if (action === 'check') submit();
    else this.modal.confirm({nzTitle: batch ? 'Retry eligible Work Orders in this batch?' : `Retry Work Order ${row.workOrderNumber}?`, nzContent: 'The server rechecks master data and duplicates. Completed orders are skipped; unresolved orders stay blocked.', nzOkText: 'Retry import', nzOnOk: submit});
  }
}
