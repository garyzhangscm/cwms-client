import { Component, OnInit, Input } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { IntegrationClientData } from '../models/integration-client-data';
import { FormGroup, FormBuilder } from '@angular/forms';
import { IntegrationClientDataService } from '../services/integration-client-data.service';
import { ClientService } from '../../common/services/client.service';
import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd';
import { InventoryActivity } from '../../inventory/models/inventory-activity';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { Item } from '../../inventory/models/item';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Client } from '../../common/models/client';
import { ItemFamily } from '../../inventory/models/item-family';

@Component({
  selector: 'app-integration-integration-data-client',
  templateUrl: './integration-data-client.component.html',
  styleUrls: ['./integration-data-client.component.less'],
})
export class IntegrationIntegrationDataClientComponent implements OnInit {
  // Select control for clients and item families
  clients: Array<{ label: string; value: string }> = [];

  // Form related data and functions
  searchForm: FormGroup;

  searching = false;

  // Table data for display
  listOfAllIntegrationClientData: IntegrationClientData[] = [];
  listOfDisplayIntegrationClientData: IntegrationClientData[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  isCollapse = false;

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private integrationClientDataService: IntegrationClientDataService,
    private clientService: ClientService,

    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllIntegrationClientData = [];
    this.listOfDisplayIntegrationClientData = [];
  }
  search(): void {
    this.searching = true;
    this.integrationClientDataService.getClientData().subscribe(integrationClientDataRes => {
      this.listOfAllIntegrationClientData = integrationClientDataRes;
      this.listOfDisplayIntegrationClientData = integrationClientDataRes;
      this.searching = false;
    });
  }

  currentPageDataChange($event: IntegrationClientData[]): void {
    this.listOfDisplayIntegrationClientData = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayIntegrationClientData = this.listOfAllIntegrationClientData.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayIntegrationClientData = this.listOfAllIntegrationClientData;
    }
  }

  ngOnInit() {
    this.initSearchForm();
  }

  initSearchForm() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],

      activityDateTimeRanger: [null],
      activityDate: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
    });
  }
}
