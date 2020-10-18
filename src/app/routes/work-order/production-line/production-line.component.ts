import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
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
      
  constructor(
    private fb: FormBuilder,
    private productionLineService: ProductionLineService,
    private i18n: I18NService,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {}

  // Select control for Location Group Types
  availableProductionLines: Array<{ label: string; value: string }> = [];
  selectedProductionLine = [];

  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  searchResult = '';

  // Table data for display
  listOfAllProductionLine: ProductionLine[] = [];
  listOfDisplayProductionLine: ProductionLine[] = [];
  

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllProductionLine = [];
    this.listOfDisplayProductionLine = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.productionLineService.getProductionLinesByNameList(this.selectedProductionLine).subscribe(
      productionLineRes => {
        this.listOfAllProductionLine = productionLineRes;
        this.listOfDisplayProductionLine = productionLineRes;

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: productionLineRes.length,
        });
      },
      () => {
        this.searching = false;
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
    this.listOfDisplayProductionLine!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: ProductionLine[]): void {
    this.listOfDisplayProductionLine! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayProductionLine!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayProductionLine!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }


    
  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedProductionLine: [null],
    });

    // initiate the select control
    this.productionLineService.getProductionLines(undefined).subscribe(productionLineRes => {
      productionLineRes.forEach(productionLine =>
        this.availableProductionLines.push({ label: productionLine.name, value: productionLine.id.toString() }),
      );
    });
  }
  disableProductionLine(productionLine: ProductionLine, disabled: boolean): void {
    this.productionLineService.disableProductionLine(productionLine, disabled).subscribe(() => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
}
