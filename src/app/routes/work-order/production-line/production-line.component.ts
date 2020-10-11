import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
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
  constructor(
    private fb: FormBuilder,
    private productionLineService: ProductionLineService,
    private i18n: I18NService,
    private messageService: NzMessageService,
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
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

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

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayProductionLine.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayProductionLine.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayProductionLine.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data 
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
