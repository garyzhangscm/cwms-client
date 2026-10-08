import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ACLService } from '@delon/acl';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { BatchDeassignComponent } from './batch-deassign.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, I18nPipe, TitleService } from '@delon/theme';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { firstValueFrom, timeout } from 'rxjs';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { ProductionLineAssignmentService } from '../services/production-line-assignment.service';
import { WorkOrderService } from '../services/work-order.service';
import { WorkOrder } from '../models/work-order';
import { Item } from '../../inventory/models/item';
import { AssignmentGroup, AssignmentRow, groupAssignments } from './production-line-assignments.data';

@Component({
  selector: 'app-production-line-assignments',
  imports: [CommonModule, FormsModule, RouterLink, I18nPipe, NzButtonModule, NzInputModule,
    NzSelectModule, NzTableModule, NzPaginationModule, NzAlertModule, NzCheckboxModule, BatchDeassignComponent],
  templateUrl: './production-line-assignments.component.html',
  styleUrls: ['./production-line-assignments.component.less']
})
export class ProductionLineAssignmentsComponent implements OnInit, OnDestroy {
  private readonly acl = inject(ACLService);
  private readonly assignments = inject(ProductionLineAssignmentService);
  private readonly workOrders = inject(WorkOrderService);
  private readonly cache = inject(LocalCacheService);
  private readonly warehouse = inject(WarehouseService);
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly title = inject(TitleService);
  private version = 0;
  selected = new Set<number>();
  batchRows: AssignmentRow[] = [];
  batchVisible = false;
  loading = false;
  failed = false;
  partial = false;
  rows: AssignmentRow[] = [];
  groups: AssignmentGroup[] = [];
  line = '';
  number = '';
  item = '';
  status = '';
  page = 1;
  readonly pageSize = 10;
  readonly statuses = ['PENDING', 'INPROCESS', 'STAGED', 'WORK_IN_PROCESS'];

  ngOnInit(): void {
    this.title.setTitle(this.i18n.fanyi('line-assignments.title'));
    void this.refresh();
  }
  ngOnDestroy(): void { this.version++; }
  get visibleGroups(): AssignmentGroup[] {
    return this.groups.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
  }
  get assignmentCount(): number { return this.groups.reduce((sum, group) => sum + group.rows.length, 0); }
  filter(): void {
    this.groups = groupAssignments(this.rows, { line: this.line, number: this.number, item: this.item, status: this.status });
    this.page = 1;
  }
  clear(): void { this.line = this.number = this.item = this.status = ''; this.filter(); }

  get canDeassign(): boolean { return this.acl.can({ role: ['/work-order/work-order', 'admin', 'system-admin'] }); }
  get allFilteredSelected(): boolean {
    const rows = this.groups.flatMap(group => group.rows).filter(row => row.id && row.workOrderId && row.lineId);
    return rows.length > 0 && rows.every(row => this.selected.has(row.id!));
  }
  toggle(row: AssignmentRow, checked: boolean): void {
    if (!this.canDeassign || !row.id || !row.workOrderId || !row.lineId) return;
    if (checked) this.selected.add(row.id); else this.selected.delete(row.id);
  }
  selectFiltered(checked: boolean): void { this.groups.forEach(group => group.rows.forEach(row => this.toggle(row, checked))); }
  openBatch(): void {
    if (!this.canDeassign || this.loading || !this.selected.size) return;
    this.batchRows = this.rows.filter(row => !!row.id && this.selected.has(row.id)).map(row => ({ ...row }));
    this.batchVisible = true;
  }
  removed(row: AssignmentRow): void {
    this.rows = this.rows.filter(existing => existing.id !== row.id);
    this.selected.delete(row.id!);
    this.filter();
  }

  async refresh(): Promise<void> {
    if (this.batchVisible) return;
    this.selected.clear();
    const version = ++this.version;
    const warehouseId = this.warehouse.getCurrentWarehouse()?.id;
    const current = () => version === this.version && warehouseId === this.warehouse.getCurrentWarehouse()?.id;
    this.loading = true;
    this.failed = this.partial = false;
    this.rows = [];
    this.filter();
    if (!warehouseId) { this.failed = true; this.loading = false; return; }
    try {
      const assignments = (await firstValueFrom(this.assignments.getProductionLineAssignments().pipe(timeout(15000))))
        .filter(assignment => !assignment.deassigned && !assignment.deassignedTime);
      if (!current()) return;
      // Each work order and item is fetched once; at most six requests run concurrently.
      const orders = new Map<number, WorkOrder>();
      const items = new Map<number, Promise<Item | undefined>>();
      const ids = [...new Set(assignments.map(a => a.workOrderId ?? a.workOrder?.id).filter((id): id is number => !!id))];
      let next = 0;
      let partial = false;
      await Promise.all(Array.from({ length: Math.min(6, ids.length) }, async () => {
        while (next < ids.length && current()) {
          const id = ids[next++];
          try {
            const order = await firstValueFrom(this.workOrders.getWorkOrder(id).pipe(timeout(10000)));
            if (!current()) return;
            if (order.warehouseId && order.warehouseId !== warehouseId) { partial = true; continue; }
            if (!order.item && order.itemId) {
              if (!items.has(order.itemId)) items.set(order.itemId, firstValueFrom(this.cache.getItem(order.itemId).pipe(timeout(10000)))
                .catch(() => { partial = true; return undefined; }));
              order.item = await items.get(order.itemId);
            }
            orders.set(id, order);
          } catch { partial = true; }
        }
      }));
      if (!current()) return;
      this.rows = assignments.map(a => {
        const order = orders.get(a.workOrderId ?? a.workOrder?.id ?? 0) ?? a.workOrder;
        return {
          id: a.id, lineId: a.productionLine?.id, line: a.productionLineName || a.productionLine?.name || '—',
          number: order?.number || a.workOrderNumber || '—',
          item: order?.item?.name || a.itemName || a.workOrderItemName || '—',
          description: order?.item?.description || a.itemDescription || '—', status: order?.status || '',
          workOrderId: a.workOrderId ?? order?.id
        };
      });
      this.partial = partial;
      this.filter();
    } catch { if (current()) this.failed = true; }
    finally { if (version === this.version) this.loading = false; }
  }
}
