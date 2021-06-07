import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';

@Injectable({
  providedIn: 'root',
})
export class ProductionLineService {
  constructor(private http: _HttpClient, private warehouseService: WarehouseService) {}

  getProductionLines(name?: string): Observable<ProductionLine[]> {
    const url = name
      ? `workorder/production-lines?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&name=${name}`
      : `workorder/production-lines?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    return this.http.get(url).pipe(map(res => res.data));
  }
  getAvailableProductionLines(): Observable<ProductionLine[]> {
    const url = `workorder/production-lines/available?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    return this.http.get(url).pipe(map(res => res.data));
  }
  getProductionLinesByIdList(productionLineIds: string[]): Observable<ProductionLine[]> {
    const idList = productionLineIds.join(',');
    const url =
      productionLineIds.length > 0
        ? `workorder/production-lines?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&ids=${idList}`
        : `workorder/production-lines?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getProductionLine(id: number): Observable<ProductionLine> {
    return this.http.get(`workorder/production-lines/${id}`).pipe(map(res => res.data));
  }

  addProductionLine(productionLine: ProductionLine): Observable<ProductionLine> {
    return this.http.post(`workorder/production-lines`, productionLine).pipe(map(res => res.data));
  }

  changeProductionLine(productionLine: ProductionLine): Observable<ProductionLine> {
    const url = `workorder/production-lines/${productionLine.id}`;
    return this.http.put(url, productionLine).pipe(map(res => res.data));
  }

  removeProductionLine(productionLine: ProductionLine): Observable<ProductionLine> {
    const url = `workorder/production-lines/${productionLine.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  disableProductionLine(productionLine: ProductionLine, disabled: boolean): Observable<ProductionLine> {
    const url = `workorder/production-lines/${productionLine.id}/disable?disabled=${disabled}`;
    return this.http.post(url).pipe(map(res => res.data));
  }
  removeProductionLines(productionLines: ProductionLine[]): Observable<ProductionLine[]> {
    const productionLineIds: number[] = [];
    productionLines.forEach(productionLine => {
      productionLineIds.push(productionLine.id!);
    });
    const params = {
      productionLineIds: productionLineIds.join(','),
    };
    return this.http.delete('workorder/production-lines', params).pipe(map(res => res.data));
  }
}
