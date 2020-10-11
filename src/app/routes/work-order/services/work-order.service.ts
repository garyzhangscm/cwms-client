import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { PickWork } from '../../outbound/models/pick-work';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
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
  ) {}

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

  allocateWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    return this.http.post(`workorder/work-orders/${workOrder.id}/allocate`).pipe(map(res => res.data));
  }

  getReturnedInventory(workOrder: WorkOrder): Observable<Inventory[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/returned-inventory`).pipe(map(res => res.data));
  }
  getProducedInventory(workOrder: WorkOrder): Observable<Inventory[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/produced-inventory`).pipe(map(res => res.data));
  }
  getDeliveredInventory(workOrder: WorkOrder): Observable<Inventory[]> {
    return this.http.get(`workorder/work-orders/${workOrder.id}/delivered-inventory`).pipe(map(res => res.data));
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
  unpick(
    workOrder: WorkOrder,
    inventory: Inventory,
    overrideConsumedQuantity: boolean,
    consumedQuantity: number,
    destinationLocationName?: string,
    immediateMove?: boolean,
  ): Observable<Inventory[]> {
    let url = `workorder/work-orders/${workOrder.id}/unpick-inventory?warehouseId=${
      this.warehouseService.getCurrentWarehouse().id
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

  printWorkOrderPickSheet(workOrder: WorkOrder) {
    const reportName = `Work Order Pick Sheet`;
    this.printingService.print(reportName, this.generateWorkOrderPickSheet(reportName, workOrder));
  }
  generateWorkOrderPickSheet(reportName: string, workOrder: WorkOrder): string[] {
    // Pages
    const pages: string[] = [];

    // Content in each page
    const pageLines: string[] = [];
    // get all the picks from the work order
    let picks: PickWork[] = [];

    // Setup the page header for each pages
    const pageHeader = `<h1>${reportName}</h1>
                        <h2>${workOrder.number}</h2>
                      <table style="margin-bottom: 20px"> 
                        <tr>
                          <td>item:</td><td>${workOrder.item!.name}</td>
                          <td>Production Line:</td><td>${workOrder.productionLine!.name}</td>
                          <td>Quantity:</td><td>${workOrder.expectedQuantity}</td>
                        </tr>
                      </table>`;

    const tableHeader = `
                    <table> 
                      <tr>
                        <th width="15%">Number:</th>
                        <th width="10%">Source:</th>
                        <th width="10%">Dest:</th>
                        <th width="15%">Item:</th>
                        <th width="20%">Desc:</th>
                        <th width="10%">Qty:</th>
                        <th width="10%">Qty Finished:</th>
                        <th width="10%">Qty Picked:</th>
                      </tr>`;

    workOrder.workOrderLines.forEach(workOrderLine => {
      picks = [...picks, ...workOrderLine.picks];
    });

    picks.forEach((pick, index) => {
      if (index % this.PICKS_PER_PAGE === 0) {
        // Add a page header
        pageLines.push(pageHeader);
        // Add a table header. The table
        // will show all the picks
        pageLines.push(tableHeader);
      }

      // table lines for each pick
      pageLines.push(`
                      <tr>
                        <th>${pick.number}</th>
                        <th>${pick.sourceLocation.name}</th>
                        <th>${pick.destinationLocation.name}</th>
                        <th>${pick.item.name}</th>
                        <th>${pick.item.description}</th>
                        <th>${pick.quantity}</th>
                        <th>${pick.pickedQuantity}</th>
                        <td>______</td>
                      </tr>`);

      if ((index + 1) % this.PICKS_PER_PAGE === 0) {
        // start a new page
        pageLines.push(`</table>`);
        pages.push(pageLines.join(''));
        pageLines.length = 0;
      }
    });
    // When picks.length % this.PICKS_PER_PAGE !== 0
    // It means we haven't setup the last page correctly yet. Let's
    // add the page end and add the last page to the page list
    if (picks.length % this.PICKS_PER_PAGE !== 0) {
      pageLines.push(`</table>`);
      pages.push(pageLines.join(''));
      pageLines.length = 0;
    }

    return pages;
  }
}
