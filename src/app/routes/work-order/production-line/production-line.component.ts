import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineService } from '../services/production-line.service';

@Component({
  selector: 'app-work-order-production-line',
  templateUrl: './production-line.component.html',
  styleUrls: ['./production-line.component.less'],
})
export class WorkOrderProductionLineComponent implements OnInit {

  listOfColumns: ColumnItem[] = [
    {
      name: 'production-line.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLine, b: ProductionLine) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-line.location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLine, b: ProductionLine) => this.utilService.compareNullableObjField(a.productionLineLocation, b.productionLineLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-line.inbound-stage-location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLine, b: ProductionLine) => this.utilService.compareNullableObjField(a.inboundStageLocation, b.inboundStageLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-line.outbound-stage-location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLine, b: ProductionLine) => this.utilService.compareNullableObjField(a.outboundStageLocation, b.outboundStageLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'single-work-order-only',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLine, b: ProductionLine) => this.utilService.compareBoolean(a.workOrderExclusiveFlag, b.workOrderExclusiveFlag),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], productionLine: ProductionLine) => list.some(workOrderExclusiveFlag => productionLine.workOrderExclusiveFlag === workOrderExclusiveFlag),
      showFilter: true
    },
    {
      name: 'enabled',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLine, b: ProductionLine) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], productionLine: ProductionLine) => list.some(enabled => productionLine.enabled === enabled),
      showFilter: true
    },
    {
      name: 'production-line.generic-purpose',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionLine, b: ProductionLine) => this.utilService.compareBoolean(a.genericPurpose, b.genericPurpose),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], productionLine: ProductionLine) => list.some(enabled => productionLine.enabled === enabled),
      showFilter: true
    },
  ];
  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;

  expandSet = new Set<number>();


  constructor(
    private fb: FormBuilder,
    private productionLineService: ProductionLineService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private locationService: LocationService,
    private activatedRoute: ActivatedRoute,
  ) { }

  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  isSpinning = false;
  // Table data for display
  listOfAllProductionLine: ProductionLine[] = [];
  listOfDisplayProductionLine: ProductionLine[] = [];

  editCache: { [key: string]: { edit: boolean; data: ProductionLine } } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllProductionLine = [];
    this.listOfDisplayProductionLine = [];

  }

  onExpandChange(productionLine: ProductionLine, expanded: boolean): void {
    if (expanded) {
      this.expandSet.add(productionLine.id!);
      // this.showProductionLineDetails(productionLine);
    } else {
      this.expandSet.delete(productionLine.id!);
    }
  }


  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.productionLineService.getProductionLines(this.searchForm.controls.name.value).subscribe(
      productionLineRes => {
        this.listOfAllProductionLine = productionLineRes;
        this.listOfDisplayProductionLine = productionLineRes;
        this.updateEditCache();

        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: productionLineRes.length,
        });
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }
  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayProductionLine!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: ProductionLine[]): void {
    this.listOfDisplayProductionLine! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayProductionLine!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayProductionLine!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }


  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
    });


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });

  }
  disableProductionLine(productionLine: ProductionLine, disabled: boolean): void {
    this.productionLineService.disableProductionLine(productionLine, disabled).subscribe(() => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  removeProductionLine(productionLine: ProductionLine): void {
    this.productionLineService.removeProductionLine(productionLine).subscribe(() => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }


  startEdit(id: string): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: string): void {
    const index = this.listOfAllProductionLine.findIndex(item => item.id === +id);
    console.log(`start to cancel edit for id: ${id} and index: ${index}`);
    this.editCache[id] = {
      data: { ...this.listOfAllProductionLine[index] },
      edit: false,
    };
  }

  saveRecord(id: string): void {
    const index = this.listOfAllProductionLine.findIndex(item => item.id === +id);

    console.log(`will save record with index: ${index}`);
    this.isSpinning = true;

    this.productionLineService.changeProductionLine(this.editCache[id].data)
      .subscribe(res => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.searchForm.controls.name.setValue(res.name);
        this.search();

        this.editCache[id].edit = false;
        this.isSpinning = false;
      },
        () => {
          this.isSpinning = true;
        });
  }

  updateEditCache(): void {
    this.listOfAllProductionLine.forEach(item => {
      this.editCache[item.id!] = {
        edit: false,
        data: { ...item }
      };
    });

  }

  processProductionLineLocationQueryResult(selectedLocationName: any, cachedRowId: number): void {
    console.log(`start to query with location name ${selectedLocationName} for id ${cachedRowId}`);
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.editCache[cachedRowId].data.productionLineLocation = res[0];
        this.editCache[cachedRowId].data.productionLineLocationId = res[0].id;
      }

    });
  }

  processProductionLineInboundLocationQueryResult(selectedLocationName: any, cachedRowId: number): void {
    console.log(`start to query with inbound location name ${selectedLocationName} for id ${cachedRowId}`);
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.editCache[cachedRowId].data.inboundStageLocation = res[0];
        this.editCache[cachedRowId].data.inboundStageLocationId = res[0].id;
      }

    });
  }

  processProductionLineOutboundLocationQueryResult(selectedLocationName: any, cachedRowId: number): void {
    console.log(`start to query with outbound location name ${selectedLocationName} for id ${cachedRowId}`);
    this.locationService.getLocations("", "", selectedLocationName).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.editCache[cachedRowId].data.outboundStageLocation = res[0];
        this.editCache[cachedRowId].data.outboundStageLocationId = res[0].id;
      }

    });
  }


  onProductionLineLocationChanged(name: string, id: number) {
    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.editCache[id].data.productionLineLocation = res[0];
        this.editCache[id].data.productionLineLocationId = res[0].id;
      }

    });

  }
  onProductionLineInboundLocationChanged(name: string, id: number) {

    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.editCache[id].data.inboundStageLocation = res[0];
        this.editCache[id].data.inboundStageLocationId = res[0].id;
      }

    });

  }
  onProductionLineOutboundLocationChanged(name: string, id: number) {
    this.locationService.getLocations("", "", name).subscribe(res => {

      // we should only get one location by the name
      if (res.length == 1) {

        this.editCache[id].data.outboundStageLocation = res[0];
        this.editCache[id].data.outboundStageLocationId = res[0].id;
      }

    });
  }

}
