import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../models/bill-of-material';
import { ProductionLine } from '../models/production-line';
import { WorkOrder } from '../models/work-order';

@Injectable({
  providedIn: 'root',
})
export class BillOfMaterialService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService, 
    private utilService: UtilService) {}

  getBillOfMaterials(number?: string, itemName?: string): Observable<BillOfMaterial[]> {
    let url = `workorder/bill-of-materials?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`; 
    if (number) {
      url = `${url}&number=${this.utilService.encodeValue(number)}`;
    }
    if (itemName) {
      url = `${url}&itemName=${itemName}`;
    }

    return this.http.get(url).pipe(map(res => res.data));
  }

  getBillOfMaterial(id: number): Observable<BillOfMaterial> {
    return this.http.get(`workorder/bill-of-materials/${id}`).pipe(map(res => res.data));
  }
  findMatchedBillOfMaterial(workOrderId: number): Observable<BillOfMaterial> {
    return this.http
      .get(`workorder/bill-of-materials/matched-with-work-order?workOrderId=${workOrderId}`)
      .pipe(map(res => res.data));
  }

  findMatchedBillOfMaterialByItemName(itemName: string): Observable<BillOfMaterial[]> {
    return this.http
      .get(
        `workorder/bill-of-materials/matched-with-item?warehouseId=${
          this.warehouseService.getCurrentWarehouse().id
        }&itemName=${itemName}`,
      )
      .pipe(map(res => res.data));
  }
  addBillOfMaterial(billOfMaterial: BillOfMaterial): Observable<BillOfMaterial> {
    return this.http.post(`workorder/bill-of-materials`, billOfMaterial).pipe(map(res => res.data));
  }

  changeBillOfMaterial(billOfMaterial: BillOfMaterial): Observable<BillOfMaterial> {
    const url = `workorder/bill-of-materials/${billOfMaterial.id}`;
    return this.http.put(url, billOfMaterial).pipe(map(res => res.data));
  }

  removeBillOfMaterial(billOfMaterial: BillOfMaterial): Observable<BillOfMaterial> {
    const url = `workorder/bill-of-materials/${billOfMaterial.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removeBillOfMaterials(billOfMaterials: BillOfMaterial[]): Observable<BillOfMaterial[]> {
    const billOfMaterialIds: number[] = [];
    billOfMaterials.forEach(billOfMaterial => {
      billOfMaterialIds.push(billOfMaterial.id!);
    });
    const params = {
      billOfMaterialIds: billOfMaterialIds.join(','),
    };
    return this.http.delete('workorder/bill-of-materials', params).pipe(map(res => res.data));
  }

  createWorkOrderFromBOM(billOfMaterial: BillOfMaterial, workOrder: WorkOrder, productionLine?: ProductionLine): Observable<WorkOrder[]> {
    let params = new HttpParams();

    // Begin assigning parameters
    params = params.append('billOfMaterialId', billOfMaterial.id!.toString());
    params = params.append('workOrderNumber', workOrder.number!);
    params = params.append('expectedQuantity', workOrder.expectedQuantity!.toString()); 
    if (productionLine != null && productionLine.id != null) {
      
        params = params.append('productionLineId', productionLine.id); 
    }
    return this.http.post('workorder/work-orders/create-from-bom', params).pipe(map(res => res.data));
  }
}
