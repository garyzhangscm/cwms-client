import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { I18NService } from 'src/app/core/i18n/i18n.service';

import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory'; 
import { ReportHistory } from '../../report/models/report-history';
import { Page } from '../../util/models/Page';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineAllocationRequest } from '../models/production-line-allocation-request';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { WorkOrder } from '../models/work-order';
import { WorkOrderKpi } from '../models/work-order-kpi';
import { WorkOrderKpiTransaction } from '../models/work-order-kpi-transaction';
import { WorkOrderLine } from '../models/work-order-line';
import { WorkOrderMaterialConsumeTiming } from '../models/work-order-material-consume-timing';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService { 
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService,
    private printingService: PrintingService,
    private utilService: UtilService, 
  ) { }

  getPageableWorkOrders(number?: string, itemName?: string, productionPlanId?: number, statusList?:string, 
    pageIndex?: number, pageSize?: number): 
      Observable<Page<WorkOrder[]>> {

      let url = `workorder/work-orders/pagination`;
     
    
      let params = new HttpParams(); 
      params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
      

      if (number) {
        params = params.append('number', this.utilService.encodeValue(number.trim()));  
      }
      if (itemName) {
        
        params = params.append('itemName', this.utilService.encodeValue(itemName.trim()));   
      }
      if (productionPlanId) {
        params = params.append('productionPlanId', productionPlanId);    
      }
      if (statusList) {
        params = params.append('statusList', statusList);  
      }
      if (pageIndex && pageIndex > 0) {
        
        params = params.append('pageIndex', pageIndex);   
      }
      if (pageSize && pageSize > 0) {
        
        params = params.append('pageSize', pageSize);   
      }
      
      return this.http.get(url, params).pipe(map(res => res.data));
  }
  getWorkOrders(number?: string, itemName?: string, productionPlanId?: number, statusList?:string): 
      Observable<WorkOrder[]> {
    
    let url = `workorder/work-orders`;
     
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 
     

    if (number) {
      params = params.append('number', this.utilService.encodeValue(number.trim()));  
    }
    if (itemName) {
      
      params = params.append('itemName', this.utilService.encodeValue(itemName.trim()));   
    }
    if (productionPlanId) {
      params = params.append('productionPlanId', productionPlanId);    
    }
    if (statusList) {
      params = params.append('statusList', statusList);  
    }
    
    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getWorkOrdersByProductionPlan(productionPlanId: number): Observable<WorkOrder[]> {
    return this.getWorkOrders(undefined, undefined, productionPlanId);
  }

  getWorkOrder(id: number): Observable<WorkOrder> {
    return this.http.get(`workorder/work-orders/${id}`).pipe(map(res => res.data));
  }
  
  getWorkOrderLine(id: number): Observable<WorkOrderLine> {
    return this.http.get(`workorder/work-orders/lines/${id}`).pipe(map(res => res.data));
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

  allocateWorkOrder(workOrder: WorkOrder, productionLineAllocationRequests?: ProductionLineAllocationRequest[]): Observable<WorkOrder> {
    let url = `workorder/work-orders/${workOrder.id}/allocate`;
    if (productionLineAllocationRequests && productionLineAllocationRequests.length > 0) {
      return this.http.post(url, productionLineAllocationRequests).pipe(map(res => res.data));
    }
    else {

      // we will allocate the whole work order, pass in an empty
      // production line list
      return this.http.post(url, []).pipe(map(res => res.data));
    }
  }

  
  reverseProduction(workOrderId: number, lpn: string): Observable<WorkOrder> {
     
    
    let url = `workorder/work-orders/${workOrderId}/reverse-production?lpn=${this.utilService.encodeValue(lpn.trim())}`; 
    return this.http.post(url).pipe(map(res => res.data)); 
  }
  
  reverseByProduct(workOrder: WorkOrder, lpn: string): Observable<WorkOrder> {
     
    
    let url = `workorder/work-orders/${workOrder.id}/reverse-by-product?lpn=${this.utilService.encodeValue(lpn.trim())}`; 
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
      url = `${url  }&overrideConsumedQuantity=${overrideConsumedQuantity}&consumedQuantity=${consumedQuantity}`;
    }

    if (destinationLocationName) {
      url = `${url  }&destinationLocationName=${destinationLocationName}`;
    }
    if (immediateMove) {
      url = `${url  }&immediateMove=${immediateMove}`;
    }
    return this.http.post(url, inventory).pipe(map(res => res.data));
  }


  printOrderPickSheet(workOrder: WorkOrder, locale?: string): Observable<ReportHistory> {
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);
    
    return this.http.post(`workorder/work-orders/${workOrder.id}/pick-report`, null, params).pipe(map(res => res.data));
  }

  changeWorkOrderConsumeMethod(workOrderId: number, 
    materialConsumeTiming: WorkOrderMaterialConsumeTiming, 
    consumeByBomFlag?: boolean, consumeByBOMId?: number): Observable<WorkOrder> {
    
    let url = `workorder/work-orders/${workOrderId}/consume-method?materialConsumeTiming=${materialConsumeTiming}`;
    if (consumeByBomFlag !== undefined && consumeByBomFlag !== null) {
      url = `${url}&consumeByBomFlag=${consumeByBomFlag}`
    }
    if (consumeByBOMId) {
      url = `${url}&consumeByBOMId=${consumeByBOMId}`
    }
    return this.http.post(url).pipe(map(res => res.data));
  }

  generatePrePrintLPNLabel(workOrderId: number, lpn: string, quantity?: number, productionLineName?: string, printerName?: string) : Observable<ReportHistory> {
    
    let url = `workorder/work-orders/${workOrderId}/pre-print-lpn-label?lpn=${lpn}`;
    
    if (quantity) {
      url = `${url}&quantity=${quantity}`
    }
    
    if (productionLineName) {
      url = `${url}&productionLineName=${productionLineName}`
    }
    if (printerName) {
      url = `${url}&printerName=${printerName}`
    }
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }
  
  generatePrePrintLPNLabelInBatch(workOrderId: number, lpn: string, quantity?: number, 
    count?: number, productionLineName?: string, copies?: number, printerName?: string) : Observable<ReportHistory> {
    
    let url = `workorder/work-orders/${workOrderId}/pre-print-lpn-label/batch?lpn=${lpn}`;
    
    if (count) {
      url = `${url}&count=${count}`
    }
    else {      
      url = `${url}&count=1`
    }

    if (quantity && quantity > 0) {
      url = `${url}&quantity=${quantity}`
    }
    if (copies) {
      url = `${url}&copies=${copies}`
    } 
    
    if (productionLineName) {
      url = `${url}&productionLineName=${productionLineName}`
    }
    if (printerName) {
      url = `${url}&printerName=${printerName}`
    }
    
    
    return this.http.post(url).pipe(map(res => res.data));
  }


  recalculateQCQuantity(workOrder: WorkOrder, qcQuantity?: number, qcPercentage?: number) :  Observable<WorkOrder> {
     
    let url = `workorder/work-orders/${workOrder.id}/recalculate-qc-quantity?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    if (qcQuantity != null) {
      url = `${url}&qcQuantity=${qcQuantity}`
    }
    if (qcPercentage != null) {
      url = `${url}&qcPercentage=${qcPercentage}`
    }
     

    return this.http.post(url).pipe(map(res => res.data));
  }

  
  getAvailableWorkOrderForMPS(itemId: number) : Observable<WorkOrder[]>{
    let url = `workorder/work-orders/available-for-mps?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&itemId=${itemId}`;
  
    
    return this.http.get(url).pipe(map(res => res.data));
  }

  changeSpareParts(workOrderLine: WorkOrderLine) : Observable<WorkOrderLine>{
    let url = `workorder/work-orders/lines/${workOrderLine.id}/spare-parts?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    
    
    return this.http.post(url, workOrderLine.workOrderLineSpareParts).pipe(map(res => res.data));
  }

}
