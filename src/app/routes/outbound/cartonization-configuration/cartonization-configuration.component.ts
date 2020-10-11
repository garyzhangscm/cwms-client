import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { PutawayConfiguration } from '../../inbound/models/putaway-configuration';
import { Item } from '../../inventory/models/item';
import { CartonizationConfiguration } from '../models/cartonization-configuration';
import { CartonizationConfigurationService } from '../services/cartonization-configuration.service';

@Component({
  selector: 'app-outbound-cartonization-configuration',
  templateUrl: './cartonization-configuration.component.html',
  styleUrls: ['./cartonization-configuration.component.less'],
})
export class OutboundCartonizationConfigurationComponent implements OnInit {
  // Form related data and functions
  searchForm!: FormGroup;
  clients: Array<{ label: string; value: string }> = [];

  // Table data for display
  listOfAllCartonizationConfiguration: CartonizationConfiguration[] = [];
  listOfDisplayCartonizationConfiguration: CartonizationConfiguration[] = [];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  searchByEnabledIndeterminate = false;

  constructor(
    private fb: FormBuilder,
    private cartonizationConfigurationService: CartonizationConfigurationService,
    private clientService: ClientService,
    private titleService: TitleService,
    private i18n: I18NService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.cartonization-configuration'));
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedClients: [null],
      pickType: [null],
      enabled: [null],
    });

    // initiate the select control
    this.clientService.loadClients().subscribe((clientList: Client[]) => {
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id.toString() }));
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.sequence) {
        this.search(params.sequence);
      }
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllCartonizationConfiguration = [];
    this.listOfDisplayCartonizationConfiguration = [];
  }
  search(sequence?: number): void {
    this.cartonizationConfigurationService
      .getAll(
        this.searchForm.controls.taggedClients.value,
        this.searchForm.controls.pickType.value,
        this.searchForm.controls.enabled.value,
        sequence,
      )
      .subscribe(cartonizationConfigurationRes => {
        this.listOfAllCartonizationConfiguration = cartonizationConfigurationRes;
        this.listOfDisplayCartonizationConfiguration = cartonizationConfigurationRes;
        console.log(`cartonizationConfigurationRes: ${JSON.stringify(cartonizationConfigurationRes)}`);
      });
  }

  currentPageDataChange($event: CartonizationConfiguration[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayCartonizationConfiguration = $event;
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data 
  }

  change(cartonizationConfiguration: CartonizationConfiguration): void {
    this.router.navigateByUrl(`/outbound/cartonization-configuration/maintenance?id=${cartonizationConfiguration.id}`);
  }
}
