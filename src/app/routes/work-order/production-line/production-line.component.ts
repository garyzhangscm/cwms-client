import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { ProductionLineService } from '../services/production-line.service';
import { ProductionLine } from '../models/production-line';

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
  searchForm: FormGroup;

  searching = false;

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
    this.productionLineService
      .getProductionLinesByNameList(this.selectedProductionLine)
      .subscribe(productionLineRes => {
        this.listOfAllProductionLine = productionLineRes;
        this.listOfDisplayProductionLine = productionLineRes;

        this.searching = false;
      });
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
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayProductionLine = this.listOfAllProductionLine.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayProductionLine = this.listOfAllProductionLine;
    }
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedProductionLine: [null],
    });

    // initiate the select control
    this.productionLineService.getProductionLines(null).subscribe(productionLineRes => {
      productionLineRes.forEach(productionLine =>
        this.availableProductionLines.push({ label: productionLine.name, value: productionLine.id.toString() }),
      );
    });
  }
  disableProductionLine(productionLine: ProductionLine, disabled: boolean) {
    this.productionLineService.disableProductionLine(productionLine, disabled).subscribe(productionLine => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
}
