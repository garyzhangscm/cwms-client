import { inject, Injectable } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PutawayConfiguration } from '../models/putaway-configuration';

@Injectable({
  providedIn: 'root',
})
export class PutawayConfigurationService {
  private PUTAWAY_LINE_PER_PAGE = 20;
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  constructor(
    private http: _HttpClient,
    private warehouseService: WarehouseService, 
    private printingService: PrintingService,
  ) { }

  getPutawayConfigurations(
    sequence?: number,
    itemName?: string,
    itemFamilyName?: string,
    inventoryStatus?: string,
  ): Observable<PutawayConfiguration[]> {
    let params = '';
    if (sequence != null) {
      params = `sequence=${sequence}`;
    }
    if (itemName != null) {
      params = `${params}&itemName=${itemName}`;
    }
    if (itemFamilyName != null) {
      params = `${params}&itemFamilyName=${itemFamilyName}`;
    }
    if (inventoryStatus != null) {
      params = `${params}&inventoryStatusId=${inventoryStatus}`;
    }
    params = `${params}&warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
    if (params.startsWith('&')) {
      params = params.substring(1);
    }

    const url = `inbound/putaway-configuration${  params.length > 0 ? `?${  params}` : ''}`;

    return this.http.get(url).pipe(map(res => res.data));
  }

  getPutawayConfiguration(id: number): Observable<PutawayConfiguration> {
    return this.http.get(`inbound/putaway-configuration/${id}`).pipe(map(res => res.data));
  }

  addPutawayConfiguration(putawayConfiguration: PutawayConfiguration): Observable<PutawayConfiguration> {
    return this.http.put(`inbound/putaway-configuration`, putawayConfiguration).pipe(map(res => res.data));
  }

  changePutawayConfiguration(putawayConfiguration: PutawayConfiguration): Observable<PutawayConfiguration> {
    const url = `inbound/putaway-configuration/${putawayConfiguration.id}`;
    return this.http.post(url, putawayConfiguration).pipe(map(res => res.data));
  }

  removePutawayConfiguration(putawayConfiguration: PutawayConfiguration): Observable<PutawayConfiguration> {
    const url = `inbound/putaway-configuration/${putawayConfiguration.id}`;
    return this.http.delete(url).pipe(map(res => res.data));
  }
  removePutawayConfigurations(putawayConfigurations: PutawayConfiguration[]): Observable<PutawayConfiguration[]> {
    const putawayConfigurationIds: number[] = [];
    putawayConfigurations.forEach(putawayConfiguration => {
      putawayConfigurationIds.push(putawayConfiguration.id!);
    });
    const params = {
      putaway_configuration_ids: putawayConfigurationIds.join(','),
    };
    return this.http.delete('inbound/putaway-configuration', params).pipe(map(res => res.data));
  }

  allocateLocation(inventory: Inventory): Observable<Inventory> {
    return this.http.post(`inbound/putaway-configuration/allocate-location`, inventory).pipe(map(res => res.data));
  }
  reallocateLocation(inventory: Inventory): Observable<Inventory> {
    return this.http.post(`inbound/putaway-configuration/reallocate-location`, inventory).pipe(map(res => res.data));
  }

  printPutawaySheet(inventories: Inventory[]) {
    const reportName = `Putaway Sheet`;
    // Get the picks for the order
    this.printingService.print(reportName, this.generatePutawayReport(reportName, inventories), PrintPageOrientation.Landscape);
  }

  generatePutawayReport(reportName: string, inventories: Inventory[]): string[] {
    // Total quantity and count of LPNs
    let totalQuantity = 0;
    const LPNs = new Set();
    const locationIDs = new Set();
    inventories.forEach(inventory => {
      totalQuantity += inventory.quantity!;
      LPNs.add(inventory.lpn);
      if (inventory.inventoryMovements !== null && inventory.inventoryMovements!.length > 0) {
        // calculate total location quantity based on the first location in the movement path
        // of the inventory
        locationIDs.add(inventory.inventoryMovements![0].locationId);
      }
    });
    // Pages
    const pages: string[] = [];

    // Content in each page
    const pageLines: string[] = [];

    // Setup the page header for each pages
    const pageHeader = `<h1>${reportName}</h1>
    
                      <table style="margin-bottom: 20px"> 
                        <tr>
                          <td colspan="3">${this.i18n.fanyi('Operator')}:</td>
                          <td colspan="3">____________</td>
                          <td colspan="3">${this.i18n.fanyi('Date')}:</td>
                          <td colspan="3">____________</td>
                        </tr>
                        <tr>
                          <td colspan="2">${this.i18n.fanyi('totalQuantity')}:</td><td colspan="2">${totalQuantity}</td>
                          <td colspan="2">${this.i18n.fanyi('totalLPNCount')}:</td><td colspan="2">${LPNs.size}</td>
                          <td colspan="2">${this.i18n.fanyi('totalLocationCount')}:</td><td colspan="2">${locationIDs.size
      }</td> 
                        </tr>
                        
                      </table>`;

    const tableHeader = `
                    <table> 
                      <tr>
                      <th>${this.i18n.fanyi('lpn')}</th>
                      <th>${this.i18n.fanyi('item')}</th>
                      <th>${this.i18n.fanyi('item.description')}</th>
                      <th>${this.i18n.fanyi('quantity')}</th>
                      <th>${this.i18n.fanyi('inventory.status')}</th>
                      <th>${this.i18n.fanyi('location')}</th>
                      <th>${this.i18n.fanyi('nextLocation')}</th>
                      <th>${this.i18n.fanyi('actualPutawayLocation')}</th>
                      </tr>`;

    inventories.forEach((inventory, index) => {
      if (index % this.PUTAWAY_LINE_PER_PAGE === 0) {
        // Add a page header
        pageLines.push(pageHeader);
        // Add a table header. The table
        // will show all the picks
        pageLines.push(tableHeader);
      }
      const nextLocation =
        inventory.inventoryMovements !== null && inventory.inventoryMovements!.length > 0
          ? inventory.inventoryMovements![0].location.name
          : '';

      // table lines for each pick
      pageLines.push(`
                        <tr>
                          <td>${inventory.lpn}</td>
                          <td>${inventory.item!.name}</td>
                          <td>${inventory.item!.description}</td>
                          <td>${inventory.quantity}</td>
                          <td>${inventory.inventoryStatus!.name}</td>
                          <td>${inventory.locationName}</td>
                          <td>${nextLocation}</td>
                          <td>____________</td>
                        </tr>`);

      if ((index + 1) % this.PUTAWAY_LINE_PER_PAGE === 0) {
        // start a new page
        pageLines.push(`</table>`);
        pages.push(pageLines.join(''));
        pageLines.length = 0;
      }
    });
    // When inventories.length % this.PUTAWAY_LINE_PER_PAGE !== 0
    // It means we haven't setup the last page correctly yet. Let's
    // add the page end and add the last page to the page list
    if (inventories.length % this.PUTAWAY_LINE_PER_PAGE !== 0) {
      pageLines.push(`</table>`);
      pages.push(pageLines.join(''));
      pageLines.length = 0;
    }

    return pages;
  }
}
