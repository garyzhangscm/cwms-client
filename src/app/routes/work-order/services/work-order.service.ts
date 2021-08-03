import { Inject, Injectable } from '@angular/core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18NService } from 'src/app/core/i18n/i18n.service';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { PickWork } from '../../outbound/models/pick-work';
import { ReportHistory } from '../../report/models/report-history';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { WorkOrder } from '../models/work-order';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  private PICKS_PER_PAGE = 20;

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private printingService: PrintingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
  ) { }

  getWorkOrders(number?: string, itemName?: string, productionPlanId?: number): Observable<WorkOrder[]> {
    let url = `workorder/work-orders?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (number) {
      url = `${url}&number=${number}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }
    if (productionPlanId) {
      url = `${url}&productionPlanId=${productionPlanId}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }

  getWorkOrdersByProductionPlan(productionPlanId: number): Observable<WorkOrder[]> {
    return this.getWorkOrders(undefined, undefined, productionPlanId);
  }

  getWorkOrder(id: number): Observable<WorkOrder> {
    return this.http.get(`workorder/work-orders/${id}`).pipe(map(res => res.data));
  }

  addWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    return this.http.post(`workorder/work-orders`, workOrder).pipe(map(res => res.data));
  }

  changeWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    const url = `workorder/work-orders/${workOrder.id}`;
    return this.http.put(url, workOrder).pipe(map(res => res.data));
  }

  removeWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    const url = `workorder/work-orders/${workOrder.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeWorkOrders(workOrders: WorkOrder[]): Observable<WorkOrder[]> {
    const workOrderIds: number[] = [];
    workOrders.forEach(workOrder => {
      workOrderIds.push(workOrder.id!);
    });
    const params = {
      workOrderIds: workOrderIds.join(','),
    };
    return this.http.delete('workorder/work-orders', params).pipe(map(res => res.data));
  }

  allocateWorkOrder(workOrder: WorkOrder, productionLineIds?: string, quantities?: string): Observable<WorkOrder> {
    let url = `workorder/work-orders/${workOrder.id}/allocate`;
    if (productionLineIds && quantities) {
      url = `${url}?productionLineIds=${productionLineIds}&quantities=${quantities}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }


  getReturnedInventory(workOrder: WorkOrder): Observable<Inventory[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/returned-inventory`).pipe(map(res => res.data));
  }
  getProducedInventory(workOrder: WorkOrder): Observable<Inventory[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/produced-inventory`).pipe(map(res => res.data));
  }
  getDeliveredInventory(workOrder: WorkOrder, productionLine?: ProductionLine): Observable<Inventory[]> {

    let url = `workorder/work-orders/${workOrder.id}/delivered-inventory`;
    if (productionLine) {
      url = `${url}?productionLineId=${productionLine.id}`;
    }
    return this.http.get(url).pipe(map(res => res.data));
  }
  getProducedByProduct(workOrder: WorkOrder): Observable<Inventory[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/produced-by-product`).pipe(map(res => res.data));
  }

  getKPIs(workOrder: WorkOrder): Observable<WorkOrderKpi[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/kpi`).pipe(map(res => res.data));
  }

  getKPITransactions(workOrder: WorkOrder): Observable<WorkOrderKpiTransaction[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/kpi-transaction`).pipe(map(res => res.data));
  }
  modifyWorkOrderLine(workOrder: WorkOrder): Observable<WorkOrder> {
    return this.http.post(`workorder/work-orders/${workOrder.id}/modify-lines`, workOrder).pipe(map(res => res.data));
  }

  changeProductionLine(workOrder: WorkOrder, productionLineId: number) {
    return this.http
      .post(`workorder/work-orders/${workOrder.id}/change-production-line?productionLineId=${productionLineId}`)
      .pipe(map(res => res.data));
  }

  assignProductionLine(workOrderId: number, productionLineAssignments: ProductionLineAssignment[]) {
    return this.http
      .post(`workorder/production-line-assignments?workOrderId=${workOrderId}`, productionLineAssignments)
      .pipe(map(res => res.data));
  }

  deassignProductionLine(workOrderId: number, productionLine: ProductionLine, returnableMaterial: Inventory[]) {
    return this.http
      .post(`workorder/production-line-assignments/deassign?workOrderId=${workOrderId}&productionLineId=${productionLine.id}`, returnableMaterial)
      .pipe(map(res => res.data));
  }
  unpick(
    workOrder: WorkOrder,
    inventory: Inventory,
    overrideConsumedQuantity: boolean,
    consumedQuantity: number,
    destinationLocationName?: string,
    immediateMove?: boolean,
  ): Observable<Inventory[]> {
    let url = `workorder/work-orders/${workOrder.id}/unpick-inventory?warehouseId=${this.warehouseService.getCurrentWarehouse().id
      }`;

    if (overrideConsumedQuantity === true) {
      url = url + `&overrideConsumedQuantity=${overrideConsumedQuantity}&consumedQuantity=${consumedQuantity}`;
    }

    if (destinationLocationName) {
      url = url + `&destinationLocationName=${destinationLocationName}`;
    }
    if (immediateMove) {
      url = url + `&immediateMove=${immediateMove}`;
    }
    return this.http.post(url, inventory).pipe(map(res => res.data));
  }



  printOrderPickSheet(workOrder: WorkOrder, locale?: string): Observable<ReportHistory> {
    if (!locale) {
      locale = this.i18n.defaultLang;
    }

    return this.http.post(`workorder/work-orders/${workOrder.id}/pick-report?locale=${locale}`).pipe(map(res => res.data));
  }

}
