import type { Inventory } from '../../inventory/models/inventory';
import type { PickWork } from '../../outbound/models/pick-work';
import type { ProductionLineAssignment } from '../models/production-line-assignment';
import type { ProductionLine } from '../models/production-line';
import type { WorkOrder } from '../models/work-order';
import type { AssignmentRow } from './production-line-assignments.data';

export type BatchState = 'pending' | 'running' | 'success' | 'blocked' | 'unknown';
export interface ReturnMaterial { inventory: Inventory; original: number; remaining: number | null; }
export interface BatchSnapshot { assignment: ProductionLineAssignment; order: WorkOrder; line: ProductionLine; inventories: Inventory[]; picks: PickWork[]; }
export interface BatchEntry { row: AssignmentRow; state: BatchState; reason: string; snapshot?: BatchSnapshot; materials: ReturnMaterial[]; confirmed: boolean; expanded: boolean; }
export interface BatchAdapter {
  read(row: AssignmentRow): Promise<BatchSnapshot>;
  write(snapshot: BatchSnapshot, materials: Inventory[]): Promise<unknown>;
  current(): boolean;
  uncertain(key: string): boolean;
  markUncertain(key: string): void;
  success(row: AssignmentRow): void;
}
export function assignmentKey(row: AssignmentRow): string { return `${row.id}:${row.workOrderId}:${row.lineId}`; }
export function snapshotFingerprint(snapshot: BatchSnapshot): string {
  return JSON.stringify({ assignmentId: snapshot.assignment.id, status: snapshot.order.status,
    inbound: snapshot.line.inboundStageLocationId,
    inventories: snapshot.inventories.map(i => [i.id, i.lpn, i.quantity, i.item?.id, i.locationId ?? i.location?.id, i.virtual, i.itemPackageType?.id, i.inventoryStatus?.id, i.lockedForAdjust, i.pickId, i.allocatedByPickId]).sort((a,b) => Number(a[0]) - Number(b[0])),
    picks: snapshot.picks.map(p => [p.id, p.quantity, p.pickedQuantity, p.destinationLocationId ?? p.destinationLocation?.id]).sort((a,b) => Number(a[0]) - Number(b[0])) });
}
export function validateSnapshot(row: AssignmentRow, snapshot: BatchSnapshot): string {
  const a = snapshot.assignment;
  if (snapshot.order.id !== row.workOrderId || !snapshot.order.status) return 'batch-deassign.assignment-changed';
  if (!row.workOrderId || !row.lineId || !a.id || a.id !== row.id || a.workOrderId !== row.workOrderId
    || a.productionLine?.id !== row.lineId || a.deassigned || a.deassignedTime) return 'batch-deassign.assignment-changed';
  if (['COMPLETED', 'CLOSED', 'CANCELLED'].includes(snapshot.order.status || '')) return 'batch-deassign.assignment-changed';
  if (!snapshot.line.inboundStageLocationId) return 'batch-deassign.missing-stage';
  const ids = new Set<number>();
  for (const inventory of snapshot.inventories) {
    if (!inventory.id || ids.has(inventory.id) || inventory.virtual || !inventory.item?.id
      || !Number.isSafeInteger(inventory.quantity) || inventory.quantity! < 0) return 'batch-deassign.invalid-inventory';
    ids.add(inventory.id);
  }
  return '';
}
export function duplicateInventories(entries: BatchEntry[]): Set<string> {
  const owners = new Map<number, Set<string>>();
  for (const entry of entries) {
    if (entry.state !== 'pending') continue;
    for (const material of entry.materials) {
      const id = material.inventory.id!;
      if (!owners.has(id)) owners.set(id, new Set());
      owners.get(id)!.add(assignmentKey(entry.row));
    }
  }
  return new Set([...owners.values()].filter(keys => keys.size > 1).flatMap(keys => [...keys]));
}
export function materialPayload(entry: BatchEntry): Inventory[] {
  return entry.materials.map(material => {
    if (material.remaining === null || !Number.isSafeInteger(material.remaining) || material.remaining < 0 || material.remaining > material.original)
      throw new Error('batch-deassign.invalid-quantity');
    // Keep the ID even at zero. An empty payload would skip material processing on the existing backend.
    return { ...material.inventory, quantity: material.remaining };
  });
}
export class BatchDeassignWorkflow {
  entries: BatchEntry[] = [];
  preparing = false;
  processing = false;
  submitted = false;
  constructor(private readonly adapter: BatchAdapter) {}
  get ready(): boolean {
    return !this.preparing && !this.processing && !this.submitted && this.entries.length > 0
      && this.entries.every(entry => entry.state === 'pending' && entry.confirmed && !!entry.snapshot
        && entry.materials.every(m => m.remaining !== null && Number.isSafeInteger(m.remaining) && m.remaining >= 0 && m.remaining <= m.original));
  }
  async prepare(rows: AssignmentRow[]): Promise<void> {
    if (this.processing || this.preparing) return;
    this.preparing = true;
    this.submitted = false;
    this.entries = rows.map(row => ({ row, state: 'pending', reason: '', materials: [], confirmed: false, expanded: false }));
    const keys = new Set<string>();
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(4, rows.length) }, async () => {
      while (next < this.entries.length && this.adapter.current()) {
        const entry = this.entries[next++];
        const key = assignmentKey(entry.row);
        if (keys.has(key)) { entry.state = 'blocked'; entry.reason = 'batch-deassign.duplicate-assignment'; continue; }
        keys.add(key);
        try {
          if (this.adapter.uncertain(key)) { entry.state = 'unknown'; entry.reason = 'batch-deassign.unknown'; continue; }
          const snapshot = await this.adapter.read(entry.row);
          if (!this.adapter.current()) return;
          const reason = validateSnapshot(entry.row, snapshot);
          if (reason) throw new Error(reason);
          entry.snapshot = snapshot;
          entry.materials = snapshot.inventories.map(inventory => ({ inventory: { ...inventory }, original: inventory.quantity!, remaining: inventory.quantity! }));
          entry.expanded = entry.materials.length > 0;
        } catch (error) {
          entry.state = 'blocked';
          entry.reason = error instanceof Error && error.message.startsWith('batch-deassign.') ? error.message : 'batch-deassign.load-failed';
        }
      }
    }));
    const duplicates = duplicateInventories(this.entries);
    for (const entry of this.entries) {
      if (duplicates.has(assignmentKey(entry.row))) {
        entry.state = 'blocked'; entry.reason = 'batch-deassign.shared-inventory';
      }
    }
    this.preparing = false;
  }
  async submit(): Promise<void> {
    if (!this.ready || !this.adapter.current()) return;
    this.processing = true;
    try {
      // Preflight every selected entry before any mutation. If one fails, submit none.
      let blocked = false;
      for (const entry of this.entries) {
        try {
          const snapshot = await this.adapter.read(entry.row);
          const reason = validateSnapshot(entry.row, snapshot);
          if (!this.adapter.current()) throw new Error('batch-deassign.context-changed');
          if (reason || snapshotFingerprint(snapshot) !== snapshotFingerprint(entry.snapshot!)) throw new Error(reason || 'batch-deassign.snapshot-changed');
          materialPayload(entry);
        } catch (error) {
          entry.state = 'blocked'; blocked = true;
          entry.reason = error instanceof Error && error.message.startsWith('batch-deassign.') ? error.message : 'batch-deassign.load-failed';
        }
      }
      if (blocked || !this.adapter.current()) return;
      this.submitted = true;
      for (const entry of this.entries) {
        if (!this.adapter.current()) { entry.state = 'blocked'; entry.reason = 'batch-deassign.context-changed'; continue; }
        let latest: BatchSnapshot;
        try {
          latest = await this.adapter.read(entry.row);
          const reason = validateSnapshot(entry.row, latest);
          if (!this.adapter.current()) throw new Error('batch-deassign.context-changed');
          if (reason || snapshotFingerprint(latest) !== snapshotFingerprint(entry.snapshot!)) throw new Error(reason || 'batch-deassign.snapshot-changed');
        } catch (error) {
          entry.state = 'blocked'; entry.reason = error instanceof Error && error.message.startsWith('batch-deassign.') ? error.message : 'batch-deassign.load-failed';
          continue;
        }
        entry.state = 'running';
        // Record uncertainty before sending: reload/navigation must not enable blind retries.
        try { this.adapter.markUncertain(assignmentKey(entry.row)); }
        catch { entry.state = 'blocked'; entry.reason = 'batch-deassign.storage-failed'; break; }
        try {
          await this.adapter.write(latest!, materialPayload(entry));
          entry.state = 'success'; entry.reason = 'batch-deassign.success';
          this.adapter.success(entry.row);
        } catch {
          entry.state = 'unknown'; entry.reason = 'batch-deassign.unknown';
          // Remote services may have committed part of the request. Stop subsequent writes.
          break;
        }
      }
    } finally { this.processing = false; }
  }
}
