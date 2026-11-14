import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ACLService } from '@delon/acl';
import { I18nPipe } from '@delon/theme';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { firstValueFrom, timeout } from 'rxjs';
import { WorkOrderService } from '../services/work-order.service';
import { ProductionLineService } from '../services/production-line.service';
import { PickService } from '../../outbound/services/pick.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { AssignmentRow } from './production-line-assignments.data';
import { BatchDeassignWorkflow, BatchSnapshot, assignmentKey } from './batch-deassign.workflow';

@Component({
  selector: 'app-batch-deassign',
  imports: [CommonModule, FormsModule, RouterLink, I18nPipe, NzModalModule, NzButtonModule,
    NzCheckboxModule, NzInputNumberModule, NzAlertModule, NzSpinModule],
  templateUrl: './batch-deassign.component.html',
  styleUrls: ['./batch-deassign.component.less']
})
export class BatchDeassignComponent implements OnInit, OnDestroy {
  @Input({ required: true }) rows: AssignmentRow[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() removed = new EventEmitter<AssignmentRow>();
  private readonly orders = inject(WorkOrderService);
  private readonly lines = inject(ProductionLineService);
  private readonly picks = inject(PickService);
  private readonly warehouse = inject(WarehouseService);
  private readonly cache = inject(LocalCacheService);
  private readonly acl = inject(ACLService);
  private alive = true;
  private warehouseId?: number;
  checking = false;
  checkMessage = '';
  globalConfirmed = false;
  readonly workflow = new BatchDeassignWorkflow({
    read: row => this.read(row),
    write: (snapshot, materials) => firstValueFrom(this.orders.deassignProductionLine(snapshot.order.id!, snapshot.line, materials).pipe(timeout(120000))),
    current: () => this.alive && this.warehouseId === this.warehouse.getCurrentWarehouse()?.id && this.canDeassign,
    uncertain: key => this.uncertain().includes(key),
    markUncertain: key => this.saveUncertain([...new Set([...this.uncertain(), key])]),
    success: row => { this.saveUncertain(this.uncertain().filter(key => key !== assignmentKey(row))); this.removed.emit(row); }
  });
  get canDeassign(): boolean { return this.acl.can({ role: ['/work-order/work-order', 'admin', 'system-admin'] }); }
  get uncertainStorageKey(): string { return `mes.batch-deassign.uncertain.${this.warehouseId}`; }
  get pendingRows(): AssignmentRow[] { return this.workflow.entries.filter(e => e.state === 'pending' || e.state === 'blocked').map(e => e.row); }
  get successes(): number { return this.workflow.entries.filter(e => e.state === 'success').length; }
  get hasUnknown(): boolean { return this.workflow.entries.some(e => e.state === 'unknown'); }
  get needsRecheck(): boolean { return this.workflow.entries.some(e => e.state === 'blocked') || (this.workflow.submitted && this.pendingRows.length > 0); }
  private uncertain(): string[] {
    const stored = sessionStorage.getItem(this.uncertainStorageKey);
    if (!stored) return [];
    const keys: unknown = JSON.parse(stored);
    if (!Array.isArray(keys) || keys.some(key => typeof key !== 'string')) throw new Error('batch-deassign.storage-failed');
    return keys;
  }
  private saveUncertain(keys: string[]): void { sessionStorage.setItem(this.uncertainStorageKey, JSON.stringify(keys)); }
  ngOnInit(): void { this.warehouseId = this.warehouse.getCurrentWarehouse()?.id; void this.prepare(this.rows); }
  ngOnDestroy(): void { this.alive = false; }
  close(): void { if (!this.workflow.processing && !this.workflow.preparing && !this.checking) this.closed.emit(); }
  async prepare(rows: AssignmentRow[]): Promise<void> {
    this.globalConfirmed = false;
    this.checkMessage = '';
    await this.workflow.prepare(rows);
  }
  confirmEmptyEntries(): void {
    if (this.workflow.processing || this.workflow.preparing || this.workflow.submitted) return;
    this.workflow.entries.filter(entry => entry.state === 'pending' && entry.snapshot && !entry.materials.length)
      .forEach(entry => entry.confirmed = true);
  }
  async submit(): Promise<void> { if (this.globalConfirmed) await this.workflow.submit(); }
  async checkResults(): Promise<void> {
    if (this.checking || this.workflow.processing) return;
    this.checking = true;
    try {
      for (const entry of this.workflow.entries.filter(e => e.state === 'unknown')) {
        const assignments = (await firstValueFrom(this.orders.getWorkOrder(entry.row.workOrderId!).pipe(timeout(15000)))).productionLineAssignments ?? [];
        const active = assignments.some(a => a.id === entry.row.id && !a.deassigned && !a.deassignedTime);
        entry.reason = active ? 'batch-deassign.still-assigned' : 'batch-deassign.deassigned-review';
      }
      this.checkMessage = 'batch-deassign.review-warning';
    } catch { this.checkMessage = 'batch-deassign.load-failed'; }
    finally { this.checking = false; }
  }
  private async read(row: AssignmentRow): Promise<BatchSnapshot> {
    if (!row.workOrderId || !row.lineId || !row.id) throw new Error('batch-deassign.assignment-changed');
    const order = await firstValueFrom(this.orders.getWorkOrder(row.workOrderId).pipe(timeout(15000)));
    if (order.warehouseId !== this.warehouseId) throw new Error('batch-deassign.context-changed');
    const active = (order.productionLineAssignments ?? []).filter(a => a.productionLine?.id === row.lineId && !a.deassigned && !a.deassignedTime);
    if (active.length !== 1 || active[0].id !== row.id) throw new Error('batch-deassign.assignment-changed');
    const line = await firstValueFrom(this.lines.getProductionLine(row.lineId).pipe(timeout(15000)));
    if (line.warehouseId !== this.warehouseId || !line.inboundStageLocationId || !order.workOrderLines?.length) throw new Error('batch-deassign.missing-stage');
    const [inventories, picks] = await Promise.all([
      firstValueFrom(this.orders.getDeliveredInventory(order, line).pipe(timeout(20000))),
      firstValueFrom(this.picks.getPicksByWorkOrderAndProductionLine(order, line).pipe(timeout(20000)))
    ]);
    // Fill only missing display metadata. Retain original IDs, quantities and locations for preflight.
    for (const inventory of inventories) {
      if (!inventory.location && inventory.locationId) {
        try { inventory.location = await firstValueFrom(this.cache.getLocation(inventory.locationId).pipe(timeout(5000))); }
        catch { /* Location ID remains visible even if its display name is unavailable. */ }
      }
    }
    return { assignment: active[0], order, line, inventories,
      picks: picks.filter(p => p.quantity > p.pickedQuantity && (p.destinationLocationId ?? p.destinationLocation?.id) === line.inboundStageLocationId) };
  }
}
