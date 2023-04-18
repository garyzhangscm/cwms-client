
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory';
import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../../work-order/models/production-line';
import { WorkOrder } from '../../work-order/models/work-order';
import { BulkPick } from '../models/bulk-pick';
import { PickGroupType } from '../models/pick-group-type.enum';
import { PickType } from '../models/pick-type.enum';
import { PickWork } from '../models/pick-work';
import { BulkPickService } from './bulk-pick.service';

@Injectable({
  providedIn: 'root',
})
export class PickService {
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private bulkPickService: BulkPickService,
    private utilService: UtilService) {}

  getPicksByOrder(orderId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, orderId);
  }
  getPicksByOrderNumber(orderNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      orderNumber,
    );
  }
  getPicksByShipment(shipmentId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, shipmentId);
  }
  getPicksByShipmentNumber(shipmentNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      shipmentNumber,
    );
  }
  getPicksByWorkOrder(workOrder: WorkOrder): Observable<PickWork[]> {
    const workOrderLineIds: number[] = [];
    workOrder.workOrderLines.forEach(workOrderLine => {
      workOrderLineIds.push(workOrderLine.id!);
    });

    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      workOrderLineIds.join(','),
    );
  }
  
  getPicksByWorkOrderAndProductionLine(workOrder: WorkOrder, productionLine: ProductionLine): Observable<PickWork[]> {
    const workOrderLineIds: number[] = [];
    workOrder.workOrderLines.forEach(workOrderLine => {
      workOrderLineIds.push(workOrderLine.id!);
    });

    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      productionLine.inboundStageLocationId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      workOrderLineIds.join(','),
    );
  }
  getPicksByWorkOrderNumber(workOrderNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      workOrderNumber,
    );
  }
  getPicksByLoad(trailerAppointmentId: number): Observable<PickWork[]> {
    return this.getPicks(
      
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      trailerAppointmentId
    );
  }
  getPicksByWave(waveId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, waveId);
  }
  getPicksByWaveNumber(waveNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      waveNumber,
    );
  }
  getPicksByPickList(pickListId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, pickListId);
  }
  getPicksByPickListNumber(pickListNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      pickListNumber,
    );
  }
  getPicksByShortAllocation(shortAllocationId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, undefined, shortAllocationId);
  }
  getPicksByCartonization(cartonizationId: number): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, undefined, undefined, cartonizationId);
  }
  getPicksByCartonizationNumber(cartonizationNumber: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      cartonizationNumber,
    );
  }
  getPicksByIds(ids: string): Observable<PickWork[]> {
    return this.getPicks(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, ids);
  }
  getPicksByContainerId(containerId: string): Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      containerId,
    );
  }

  queryPicks(
    number?: string,
    orderNumber?: string,
    itemNumber?: string,
    sourceLocation?: string,
    destinationLocation?: string,
    shortAllocationId?: number,
    openPickOnly?: boolean,
    loadDetails?: boolean,
  ): Observable<PickWork[]> {
    return this.getPicks(
      number,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      shortAllocationId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      itemNumber,
      sourceLocation,
      destinationLocation,
      orderNumber,  
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      openPickOnly,
      loadDetails
    );
  }
  getPickBySourceLocationIdAndItemId(itemId: number, sourceLocationId: number) : Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      itemId,
      sourceLocationId
    );
  }
  getOpenPicksBySourceLocationIdAndItemId(itemId: number, sourceLocationId: number) : Observable<PickWork[]> {
    return this.getPicks(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      itemId,
      sourceLocationId,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      true
    );
  }
  getPicks(
    number?: string,
    orderId?: number,
    shipmentId?: number,
    workOrderId?: number,
    waveId?: number,
    listId?: number,
    shortAllocationId?: number,
    cartonizationId?: number,
    ids?: string,
    itemId?: number,
    sourceLocationId?: number,
    destinationLocationId?: number,
    itemNumber?: string,
    sourceLocationName?: string,
    destinationLocationName?: string,
    orderNumber?: string,
    shipmentNumber?: string,
    workOrderNumber?: string,
    waveNumber?: string,
    pickListNumber?: string,
    cartonizationNumber?: string,
    containerId?: string,
    workOrderLineIds?: string, 
    openPickOnly?: boolean,
    loadDetails?: boolean,
    trailerAppointmentId?: number,
    forDisplay?: boolean
  ): Observable<PickWork[]> {
     
    
    const url = `outbound/picks`;    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id); 

    if (number) {
      params = params.append('number', number);  
    }

    if (orderId) {
      params = params.append('orderId', orderId);   
    }
    if (shipmentId) {
      params = params.append('shipmentId', shipmentId);  
    }

    if (trailerAppointmentId) {
      params = params.append('trailerAppointmentId', trailerAppointmentId);   
    }
    
    if (workOrderId) {
      params = params.append('workOrderId', workOrderId);    
    }
    if (waveId) {
      params = params.append('waveId', waveId);     
    }
    if (ids) {
      params = params.append('ids', ids);    
    }
    if (listId) {
      params = params.append('listId', listId); 
    }
    if (cartonizationId) {
      params = params.append('cartonizationId', cartonizationId);  
    }
    if (itemId) {
      params = params.append('itemId', itemId);   
    }
    if (sourceLocationId) {
      params = params.append('sourceLocationId', sourceLocationId);  
    }
    if (destinationLocationId) {
      params = params.append('destinationLocationId', destinationLocationId);   
    }
    if (shortAllocationId) {
      params = params.append('shortAllocationId', shortAllocationId); 
    }

    if (orderNumber) {
      params = params.append('orderNumber', orderNumber);  
    }

    if (shipmentNumber) {
      params = params.append('shipmentNumber', shipmentNumber);   
    }

    if (workOrderNumber) {
      params = params.append('workOrderNumber', workOrderNumber.trim());    
    }
    if (waveNumber) {
      params = params.append('waveNumber', waveNumber.trim()); 
    }

    if (pickListNumber) {
      params = params.append('pickListNumber', pickListNumber.trim()); 
    }
    if (cartonizationNumber) {
      params = params.append('cartonizationNumber', cartonizationNumber.trim());  
    }
    if (itemNumber) {
      params = params.append('itemNumber', itemNumber.trim());  
    }
    if (sourceLocationName) {
      params = params.append('sourceLocationName', sourceLocationName.trim());  
    }
    if (destinationLocationName) {
      params = params.append('destinationLocationName', destinationLocationName.trim());  
    }
    if (containerId) {
      params = params.append('containerId', containerId);  
    }
    if (workOrderLineIds) {
      params = params.append('workOrderLineIds', workOrderLineIds.trim());  
    }
    if (openPickOnly != null) {
      params = params.append('openPickOnly', openPickOnly);  

    }
    if (loadDetails != null) {
      params = params.append('loadDetails', loadDetails);  

    }
    if (forDisplay != null) {
      params = params.append('forDisplay', forDisplay);  

    }


    return this.http.get(url, params).pipe(map(res => res.data));
  }

  getPick(id: number): Observable<PickWork> {
    return this.http.get(`outbound/picks/${id}`).pipe(map(res => res.data));
  }

  addPick(pick: PickWork): Observable<PickWork> {
    return this.http.post(`outbound/picks`, pick).pipe(map(res => res.data));
  }

  changePick(pick: PickWork): Observable<PickWork> {
    const url = `outbound/picks/${pick.id}`;
    return this.http.put(url, pick).pipe(map(res => res.data));
  }
  cancelPick(pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): Observable<PickWork> {
    const url = `outbound/picks/${pick.id}`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`errorLocation`, errorLocation);
    params = params.append(`generateCycleCount`, generateCycleCount);

    return this.http.delete(url, params).pipe(map(res => res.data));
  }

  cancelPicks(picks: PickWork[], errorLocation: boolean, generateCycleCount: boolean): Observable<PickWork[]> {
    const pickIds: number[] = [];
    picks.forEach(pick => {
      pickIds.push(pick.id);
    }); 

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`errorLocation`, errorLocation);
    params = params.append(`generateCycleCount`, generateCycleCount);
    params = params.append(`pick_ids`, pickIds.join(','));

    return this.http.delete('outbound/picks', params).pipe(map(res => res.data));
  }

  confirmPick(
    pick: PickWork,
    quantity?: number,
    pickToContainer?: boolean,
    containerId?: string,
  ): Observable<PickWork> {
    const confirmedQuantity = quantity === undefined ? pick.quantity - pick.pickedQuantity : quantity;
    let url = `outbound/picks/${pick.id}/confirm?quantity=${confirmedQuantity}`;

    if (pickToContainer) {
      url = `${url}&pickToContainer=${pickToContainer}`;
    }
    if (containerId) {
      url = `${url}&containerId=${containerId}`;
    }
    return this.http.post(url).pipe(map(res => res.data));
  }

  getPickedInventories(picks: PickWork[], includeVirturalInventory?: boolean): Observable<Inventory[]> {
    const pickIds = picks.map(pick => pick.id).join(',');
    let url = `inventory/inventories?warehouseId=${this.warehouseService.getCurrentWarehouse().id}&pickIds=${pickIds}`;
    if (includeVirturalInventory) {
      url = `${url}&includeVirturalInventory=${includeVirturalInventory}`;
    }

    return this.http
      .get(url)
      .pipe(map(res => res.data));
  }

  isSinglePick(pick: PickWork): boolean {
    return (pick.bulkPickNumber == null || pick.bulkPickNumber.length == 0) &&
            (pick.pickListNumber == null || pick.pickListNumber.length == 0) &&
            (pick.cartonizationNumber == null || pick.cartonizationNumber.length == 0);
  }
  isInListPick(pick: PickWork) : boolean {
    return pick.pickListNumber != null && pick.pickListNumber.length > 0;
  }
  isInBulkPick(pick: PickWork) : boolean {
    return pick.bulkPickNumber != null && pick.bulkPickNumber.length > 0;
  }
  isInCartonPick(pick: PickWork) : boolean {
    return pick.cartonizationNumber != null && pick.cartonizationNumber.length > 0;
  }
  // we will group picks into list / bulk for display purpose
  async setupPicksForDisplay(picks: PickWork[]) : Promise<PickWork[]> {
    let pickResult : PickWork[] = [];

    let picksInBulk: PickWork[] = picks.filter(pick => this.isInBulkPick(pick));
    let picksInList: PickWork[] = picks.filter(pick => this.isInListPick(pick));

    // add single picks first
    pickResult =  picks.filter(pick => this.isSinglePick(pick)) ;

    if (picksInBulk.length > 0) {
      // add bulk pick 
      let bulkPickNumbers = new Set<string>();
      
      picksInBulk.forEach(pick => {
        bulkPickNumbers.add(pick.bulkPickNumber!)
      }); 
      
      let responseData = await this.bulkPickService.getBulkPicksSynchronous(
        undefined, Array.from(bulkPickNumbers).join(',')
      );
      let bulkPicks: BulkPick[] = responseData.data;
      
      // console.log("=======   Bulk picks  =========");
      // console.log(`${JSON.stringify(bulkPicks)}`);
      
      pickResult = [...pickResult, 
        ...bulkPicks.map(bulkPick => this.setupPicksFromBulkPick(bulkPick))];
      /**
       * 
      this.bulkPickService.getBulkPicks(undefined, Array.from(bulkPickNumbers).join(',')).subscribe({
        next: (bulkPicks) => {

          pickResult = [...pickResult, 
              ...bulkPicks.map(bulkPick => this.setupPicksFromBulkPick(bulkPick))];

          console.log("=======   Pick Result after process Bulk Pick   =========");
          console.log(`${JSON.stringify(pickResult)}`);
        }
      });
       * 
       */
    }
    return pickResult;


  }
  
  releasePick(pickId: number): Observable<BulkPick> {
    const url = `outbound/picks/${pickId}/release`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }
  assignUser(pickId: number, userId: number): Observable<BulkPick> {
    const url = `outbound/picks/${pickId}/assign-user`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`userId`, userId); 

    return this.http.post(url, undefined, params).pipe(map(res => res.data));
  }

  setupPicksFromBulkPick(bulkPick: BulkPick) : PickWork {
    return {
        id: bulkPick.id,
        number: bulkPick.number,
        sourceLocationId: bulkPick.sourceLocationId,
        sourceLocation: bulkPick.sourceLocation,
        destinationLocationId: undefined,    // bulk pick may have multiple destination location
        destinationLocation:  undefined,    // bulk pick may have multiple destination location

        itemId: bulkPick.itemId,
        item: bulkPick.item,

        quantity: bulkPick.quantity,
        pickedQuantity: bulkPick.pickedQuantity,
        pickType: PickType.OUTBOUND,   // FOR now we will only allow outbound bulk pick
  
        color:bulkPick.color,
        productSize: bulkPick.productSize,
        style: bulkPick.style,

        status: bulkPick.status, 
        picks: bulkPick.picks,
        pickGroupType: PickGroupType.BULK_PICK,
        
        workTaskId: bulkPick.workTaskId,
        workTask: bulkPick.workTask,
    }
  }
}
