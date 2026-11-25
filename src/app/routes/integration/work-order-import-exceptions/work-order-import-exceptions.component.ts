import { inject as injectWebI18n } from '@angular/core';
import { I18NService as WebI18nService } from '@core';
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
interface Listing { rows: ImportRow[]; total: number; truncated: boolean; canRetry: boolean; canActOnSingle?: boolean; }
interface RecoveryJob {
  id: string;
  state: string;
  completed: string[];
  submitted: string[];
  existing: string[];
  notFound: string[];
  failed: { itemNumber: string; reason: string }[];
  error?: string;
}

const RECOVERY_API = 'work-order-import/missing-items';

interface Detail { report: { records?: ImportRow[]; state?: string; reason?: string; sourceCleanup?: string }; converted: { workOrderNumber: string; quantityAdjustments: Adjustment[]; payload: { expectedQuantity: number; itemName: string } }[]; originalRows: Record<string, string>[]; history: Job[]; }

@Component({selector: 'app-work-order-import-exceptions', standalone: false,
  templateUrl: './work-order-import-exceptions.component.html', styleUrls: ['./work-order-import-exceptions.component.less']})
export class WorkOrderImportExceptionsComponent implements OnInit, OnDestroy {
  private readonly webI18n = injectWebI18n(WebI18nService);
  rows: ImportRow[] = []; jobs: Job[] = []; batch = ''; number = ''; state = '';
  loading = false; submitting = false; canRetry = false; canActOnSingle = false; error = ''; jobError = ''; truncated = false;
  detail?: Detail; selected?: ImportRow; detailVisible = false; detailLoading = false;
  private readonly destroyed = new Subject<void>();
  private refresh?: ReturnType<typeof setInterval>;
  private polling = false;
  sessionRejected = false;
  recoveryConfigured = false;
  recoveringItems = false;
  recovery?: RecoveryJob;
  recoveryError = '';
  private recoveryTimer?: ReturnType<typeof setTimeout>;
  private recoveryPollFailures = 0;
  readonly states = ['BLOCKED', 'BUSINESS_ERROR', 'UNCERTAIN', 'REJECTED'];
  constructor(private http: HttpClient, private users: UserService, private messages: NzMessageService, private modal: NzModalService) {}
  ngOnInit(): void {
    this.load();
    this.loadJobs();
    this.refresh = setInterval(() => this.loadJobs(), 5000);
    this.http.get<Response<{ configured: boolean; healthy: boolean }>>(`${RECOVERY_API}/healthz`)
      .pipe(takeUntil(this.destroyed)).subscribe({
        next: ({ data }) => {
          this.recoveryConfigured = data?.configured === true && data.healthy === true;
          if (this.recoveryConfigured && this.canRetry) this.loadLatestRecovery();
        },
        error: () => { this.recoveryConfigured = false; }
      });
  }

  ngOnDestroy(): void {
    if (this.refresh) clearInterval(this.refresh);
    if (this.recoveryTimer) clearTimeout(this.recoveryTimer);
    this.destroyed.next();
    this.destroyed.complete();
  }

  private loadLatestRecovery(): void {
    this.http.get<Response<RecoveryJob | null>>(`${RECOVERY_API}/latest`, { headers: this.headers() })
      .pipe(takeUntil(this.destroyed)).subscribe({
        next: ({ data }) => {
          if (!data || this.recoveringItems || this.recovery) return;
          this.recovery = data;
          if (this.isRecoveryPending(data)) this.pollRecovery(data.id);
        },
        error: err => {
          this.recoveryError = this.pageError(err, 'Unable to load the latest item import.');
        }
      });
  }

  recoverMissingItems(): void {
    if (!this.canRetry || !this.recoveryConfigured || this.recoveringItems) return;
    this.modal.confirm({
      nzTitle: 'Import missing items from Oracle?',
      nzContent: 'This checks all current work order exceptions and imports matching items. Work orders are not retried automatically.',
      nzOkText: 'Import Items',
      nzOnOk: () => {
        if (!this.canRetry || !this.recoveryConfigured || this.recoveringItems) return;
        this.recoveringItems = true;
        this.recoveryError = '';
        this.recovery = undefined;
        this.recoveryPollFailures = 0;
        this.http.post<Response<RecoveryJob>>(`${RECOVERY_API}/resolve`, {}, { headers: this.headers() })
          .pipe(takeUntil(this.destroyed)).subscribe({
            next: ({ data }) => {
              this.recovery = data;
              this.pollRecovery(data.id);
            },
            error: err => {
              this.recoveringItems = false;
              this.recoveryError = this.pageError(err, 'Unable to start item import.');
            }
          });
      }
    });
  }

  private isRecoveryPending(job: RecoveryJob): boolean {
    return ['QUEUED', 'RUNNING', 'PROCESSING'].includes(job.state)
      || (job.state === 'FINISHED' && job.submitted.length > 0);
  }

  private pollRecovery(id: string): void {
    this.recoveringItems = true;
    this.http.get<Response<RecoveryJob>>(`${RECOVERY_API}/jobs/${encodeURIComponent(id)}`, { headers: this.headers() })
      .pipe(takeUntil(this.destroyed)).subscribe({
        next: ({ data }) => {
          this.recovery = data;
          this.recoveryPollFailures = 0;
          if (this.isRecoveryPending(data)) {
            this.recoveryTimer = setTimeout(() => this.pollRecovery(id), 2500);
          } else {
            this.recoveringItems = false;
            this.load();
          }
        },
        error: err => {
          if (err.status !== 401 && ++this.recoveryPollFailures < 3) {
            this.recoveryTimer = setTimeout(() => this.pollRecovery(id), 5000);
          } else {
            this.recoveringItems = false;
            this.recoveryError = this.pageError(err, 'Unable to check item import status. Reload the page before trying again.');
          }
        }
      });
  }

  private pageError(err: { status?: number; error?: { message?: string } }, fallback: string): string {
    if (err.status === 401) {
      this.sessionRejected = true;
      this.canRetry = false; this.canActOnSingle = false;
      return this.webI18n.fanyi('The import service could not verify this session. Try Search / Refresh. If the message persists, sign in again.');
    }
    return err.error?.message || this.webI18n.fanyi(fallback);
  }

  private headers(): HttpHeaders { return new HttpHeaders({'X-CWMS-Username': this.users.getCurrentUsername()}); }
  label(state: string): string { return this.webI18n.fanyi(({PREPARED: 'Ready to import', BLOCKED: 'Needs attention', ACCEPTED: 'Processing in MES', BUSINESS_ERROR: 'MES error', UNCERTAIN: 'Verify previous request', COMPLETED: 'Completed', SKIPPED_EXISTING: 'Already exists', REJECTED: 'Batch rejected', NO_NEW_WORK_ORDERS: 'No changes', NOT_CHECKED: 'Not checked'} as Record<string, string>)[state] || state); }
  load(): void {
    if (this.loading) return;
    if (this.sessionRejected) this.recoveryError = '';
    this.sessionRejected = false;
    this.loading = true; this.error = '';
    const params = new HttpParams().set('batch', this.batch.trim()).set('number', this.number.trim()).set('state', this.state);
    this.http.get<Response<Listing>>('work-order-import/batches', {headers: this.headers(), params}).pipe(takeUntil(this.destroyed)).subscribe({
      next: res => {
        const wasOperator = this.canRetry;
        this.rows = res.data.rows;
        this.canRetry = res.data.canRetry === true;
        this.canActOnSingle = this.canRetry || res.data.canActOnSingle === true;
        this.truncated = res.data.truncated;
        this.loading = false;
        if (!wasOperator && this.canRetry && this.recoveryConfigured) this.loadLatestRecovery();
      },
      error: err => { this.error = this.pageError(err, 'Unable to load import exceptions'); this.canRetry = false; this.canActOnSingle = false; this.loading = false; }
    });
  }
  loadJobs(): void {
    if (this.polling || this.sessionRejected) return;
    this.polling = true;
    this.http.get<Response<Job[]>>('work-order-import/jobs', {headers: this.headers()}).pipe(takeUntil(this.destroyed)).subscribe({
      next: res => {
        const changed = this.jobs.some(old => ['QUEUED', 'RUNNING'].includes(old.state) && res.data.some(job => job.id === old.id && job.state !== old.state));
        this.jobs = res.data; this.polling = false; this.jobError = '';
        if (changed || this.rows.some(row => row.state === 'ACCEPTED')) { this.load(); if (this.detailVisible && this.selected) this.showDetail(this.selected); }
      },
      error: err => { this.polling = false; this.jobError = this.pageError(err, 'Unable to refresh action results. Please refresh or check your connection.'); }
    });
  }
  showDetail(row: ImportRow): void {
    this.selected = row; this.detailVisible = true; this.detailLoading = true; this.detail = undefined;
    const params = new HttpParams().set('file', row.file).set('number', row.workOrderNumber || '');
    this.http.get<Response<Detail>>('work-order-import/batch', {headers: this.headers(), params}).pipe(takeUntil(this.destroyed)).subscribe({
      next: res => { if (this.selected?.file !== row.file || this.selected?.workOrderNumber !== row.workOrderNumber) return; this.detail = res.data; this.detailLoading = false; },
      error: err => { this.messages.error(this.pageError(err, 'Unable to load batch details')); this.detailLoading = false; }
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
    const allowed = () => batch ? this.canRetry : this.canActOnSingle && !!row.workOrderNumber?.trim();
    if (!allowed() || this.submitting || this.busy(row)) return;
    const submit = (): void => {
      if (!allowed() || this.submitting || this.busy(row)) return;
      this.submitting = true;
      this.http.post<Response<Job>>('work-order-import/actions', {file: row.file, workOrderNumber: batch ? '' : row.workOrderNumber || '', action}, {headers: this.headers()}).pipe(takeUntil(this.destroyed)).subscribe({
        next: res => { this.jobs = [res.data, ...this.jobs]; this.submitting = false; this.messages.info(this.webI18n.fanyi('web.message.c29668711323')); },
        error: err => { this.submitting = false; this.messages.error(this.pageError(err, 'Unable to queue this action')); }
      });
    };
    if (action === 'check') submit();
    else this.modal.confirm({nzTitle: batch ? this.webI18n.fanyi('Retry eligible Work Orders in this batch?') : this.webI18n.fanyi('Retry Work Order {{order}}?', {order: row.workOrderNumber}), nzContent: this.webI18n.fanyi('The server rechecks master data and duplicates. Completed orders are skipped; unresolved orders stay blocked.'), nzOkText: this.webI18n.fanyi('Retry import'), nzOnOk: submit});
  }
}
