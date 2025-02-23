import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service'; 
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { CartonizationConfiguration } from '../models/cartonization-configuration';
import { CartonizationConfigurationService } from '../services/cartonization-configuration.service';

@Component({
    selector: 'app-outbound-cartonization-configuration',
    templateUrl: './cartonization-configuration.component.html',
    styleUrls: ['./cartonization-configuration.component.less'],
    standalone: false
})
export class OutboundCartonizationConfigurationComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<CartonizationConfiguration>> = [
    {
      name: 'sequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CartonizationConfiguration, b: CartonizationConfiguration) => this.utilService.compareNullableNumber(a.sequence, b.sequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'client',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CartonizationConfiguration, b: CartonizationConfiguration) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'pick.type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CartonizationConfiguration, b: CartonizationConfiguration) => this.utilService.compareNullableString(a.pickType?.toString(), b.pickType?.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'cartonization.group-key',
      showSort: false,
      sortOrder: null,
      sortFn: null,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      showSort: true,
      sortOrder: null,
      sortFn: (a: CartonizationConfiguration, b: CartonizationConfiguration) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], cartonizationConfiguration: CartonizationConfiguration) => list.some(enabled => cartonizationConfiguration.enabled === enabled),
      showFilter: true
    },
  ];

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  clients: Array<{ label: string; value: string }> = [];

  // Table data for display
  listOfAllCartonizationConfiguration: CartonizationConfiguration[] = [];
  listOfDisplayCartonizationConfiguration: CartonizationConfiguration[] = [];


  searchByEnabledIndeterminate = false;

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private cartonizationConfigurationService: CartonizationConfigurationService,
    private clientService: ClientService,
    private titleService: TitleService, 
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private utilService: UtilService,
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/cartonization-configuration").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                      
  }
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
      clientList.forEach(client => this.clients.push({ label: client.description, value: client.id!.toString() }));
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['sequence']) {
        this.search(params['sequence']);
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
        this.searchForm.value.taggedClients,
        this.searchForm.value.pickType,
        this.searchForm.value.enabled,
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

  change(cartonizationConfiguration: CartonizationConfiguration): void {
    this.router.navigateByUrl(`/outbound/cartonization-configuration/maintenance?id=${cartonizationConfiguration.id}`);
  }
}
