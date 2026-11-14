
import { HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Inventory } from '../../inventory/models/inventory'; 
import { ReportHistory } from '../../report/models/report-history';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../../work-order/models/production-line';
import { WorkOrder } from '../../work-order/models/work-order';
import { BulkPick } from '../models/bulk-pick';
import { PickGroupType } from '../models/pick-group-type.enum';
import { PickList } from '../models/pick-list';
import { PickListStatus } from '../models/pick-list-status.enum';
import { PickStatus } from '../models/pick-status.enum';
import { PickType } from '../models/pick-type.enum';
import { PickWork } from '../models/pick-work';
import { BulkPickService } from './bulk-pick.service';
import { PickListService } from './pick-list.service';

@Injectable({
  providedIn: 'root',
})
export class PickService {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService, 
    private companyService: CompanyService, 
    private bulkPickService: BulkPickService, 
    private pickListService: PickListService ) {}

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
  cancelPick(pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): Observable<PickWork[]> {
    const url = `outbound/picks/${pick.id}`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`errorLocation`, errorLocation);
    params = params.append(`generateCycleCount`, generateCycleCount);

    return this.http.delete(url, params).pipe(map(res => res.data));
  }

  cancelPicks(picks: PickWork[], errorLocation: boolean, generateCycleCount: boolean): Observable<string> {
    if (picks.length == 0) {
      
      return of("");
    }
    const pickIds: number[] = [];
    picks.forEach(pick => {
      pickIds.push(pick.id);
    }); 

    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append(`errorLocation`, errorLocation);
    params = params.append(`generateCycleCount`, generateCycleCount);
    params = params.append(`pickIds`, pickIds.join(','));

    return this.http.delete('outbound/picks', params).pipe(map(res => res.data));
  }

  confirmPick(
    pick: PickWork,
    quantity?: number,
    pickToContainer?: boolean,
    containerId?: string,
  ): Observable<PickWork> {
    const confirmedQuantity = quantity === undefined ? pick.quantity - pick.pickedQuantity : quantity;
    let url = `outbound/picks/${pick.id}/confirm`;
    
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id); 
    params = params.append('companyId', this.companyService.getCurrentCompany()!.id); 
    params = params.append('quantity', confirmedQuantity); 


    if (pickToContainer) {
      
      params = params.append('pickToContainer', pickToContainer); 
    }
    if (containerId) {
      params = params.append('containerId', containerId);  
    }
    return this.http.post(url, undefined, params).pipe(map(res => res.data));
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

    // for single picks, don't show the expand button
    pickResult.forEach(pick => { 
      pick.showExpand = false;
      pick.pickGroupType = PickGroupType.SINGLE_PICK;
      // console.log(`single pick ${pick.number}'s item is ${pick.itemId} / ${pick.item?.name}`);
    });

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
    
    if (picksInList.length > 0) {
      // add pick list
      let pickListNumbers = new Set<string>();
      
      picksInList.forEach(pick => {
        pickListNumbers.add(pick.pickListNumber!)
      }); 
      
      let responseData = await this.pickListService.getPickListsSynchronous(
        undefined, Array.from(pickListNumbers).join(',')
      );
      let pickLists: PickList[] = responseData.data;
      
      // console.log("=======   Bulk picks  =========");
      // console.log(`${JSON.stringify(bulkPicks)}`);
      
      pickResult = [...pickResult, 
        ...pickLists.map(pickList => this.setupPicksFromPickList(pickList))];
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
  unassignUser(pickId: number): Observable<BulkPick> {
    const url = `outbound/picks/${pickId}/unassign-user`;
    let params = new HttpParams(); 

    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

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
        showExpand: true,
    }
  }
  setupPicksFromPickList(pickList: PickList) : PickWork {
    let totalQuantity = 0;
    let totalPickedQuantity = 0;
    let itemIdSet = new Set<number  | undefined>();
    let sourceLocationIdSet = new Set<number  | undefined>();
    let destinationLocationIdSet = new Set<number  | undefined>();

    let colorSet = new Set<string | undefined>();
    let productSizeSet = new Set<string | undefined>();
    let styleSet = new Set<string | undefined>();

    pickList.picks.forEach(pick => {
      totalQuantity += pick.quantity;
      totalPickedQuantity += pick.pickedQuantity;
      itemIdSet.add(pick.itemId);
      sourceLocationIdSet.add(pick.sourceLocationId);
      destinationLocationIdSet.add(pick.destinationLocationId);

      colorSet.add(pick.color);
      productSizeSet.add(pick.productSize);
      styleSet.add(pick.style);
    });

    let pickStatus = PickStatus.PENDING; 

    switch(pickList.status) {
      case PickListStatus.INPROCESS:
        pickStatus = PickStatus.INPROCESS
      break;
      case PickListStatus.RELEASED:
        pickStatus = PickStatus.RELEASED
      break;
      case PickListStatus.CANCELLED:
        pickStatus = PickStatus.CANCELLED
      break;
      case PickListStatus.COMPLETED:
        pickStatus = PickStatus.COMPLETED
      break;

    } 

    return {
        id: pickList.id,
        number: pickList.number,
        sourceLocationId: sourceLocationIdSet.size != 1 ? undefined :  pickList.picks[0].sourceLocationId,
        sourceLocation: sourceLocationIdSet.size != 1 ? undefined :  pickList.picks[0].sourceLocation,
        destinationLocationId: destinationLocationIdSet.size != 1 ? undefined :  pickList.picks[0].destinationLocationId,    // list pick may have multiple destination location
        destinationLocation:  destinationLocationIdSet.size != 1 ? undefined :  pickList.picks[0].destinationLocation,    // list pick may have multiple destination location

        itemId: itemIdSet.size != 1 ? undefined : pickList.picks[0].itemId,
        item: itemIdSet.size != 1 ? undefined : pickList.picks[0].item,

        quantity: totalQuantity,
        pickedQuantity: totalPickedQuantity,
        pickType: PickType.OUTBOUND,   // FOR now we will only allow outbound bulk pick
  
        color: colorSet.size != 1 ? undefined : colorSet.values().next().value, 
        productSize: productSizeSet.size != 1 ? undefined : productSizeSet.values().next().value, 
        style: styleSet.size != 1 ? undefined : styleSet.values().next().value, 

        status: pickStatus, 
        picks: pickList.picks,
        pickGroupType: PickGroupType.LIST_PICK,
        
        workTaskId: pickList.workTaskId,
        workTask: pickList.workTask,
        showExpand: true,
    }
  }
 
  
  generatePickSheet(pickIds: string, locale?: string): Observable<ReportHistory> {
    
    let params = new HttpParams();

    if (!locale) {
      locale = this.i18n.defaultLang;
    }
    params = params.append('locale', locale);
    params = params.append('ids', pickIds);
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.post(`outbound/picks/pick-report`, null, params).pipe(map(res => res.data));
  } 

  getPickCount(): Observable<number> {
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.get(`outbound/picks/count`, params).pipe(map(res => res.data));
  }
  
  getOpenPickCount(): Observable<number> {
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.get(`outbound/picks/open-pick/count`, params).pipe(map(res => res.data));
  }
  getCompletedPickCount(): Observable<number> {
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.get(`outbound/picks/completed-pick/count`, params).pipe(map(res => res.data));
  }

  getPickCountByLocationGroup(): Observable<Map<String, number[]>> {
    
    let params = new HttpParams(); 
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse()!.id);  

    return this.http.get(`outbound/picks/count-by-location-group`, params).pipe(map(res => res.data));
  }

}
