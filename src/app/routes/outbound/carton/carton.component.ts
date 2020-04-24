import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Carton } from '../models/carton';
import { NzInputDirective, NzMessageService } from 'ng-zorro-antd';
import { CartonService } from '../services/carton.service';
import { I18NService } from '@core';

@Component({
  selector: 'app-outbound-carton',
  templateUrl: './carton.component.html',
  styleUrls: ['./carton.component.less'],
})
export class OutboundCartonComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;

  creatingCartonForm: FormGroup;
  // Table data for display
  listOfAllCartons: Carton[] = [];
  listOfDisplayCartons: Carton[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  searchByEnabledIndeterminate = true;
  creatingCartonModalVisible = false;

  // editable cell
  editId: string | null;
  editCol: string | null;

  constructor(
    private fb: FormBuilder,
    private cartonService: CartonService,
    private i18n: I18NService,

    private messageService: NzMessageService,
  ) {}

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      enabled: [null],
    });

    this.creatingCartonForm = this.fb.group({
      name: [null, Validators.required],
      length: [null, Validators.required],
      width: [null, Validators.required],
      height: [null, Validators.required],
      fillRate: [null, Validators.required],
      enabled: [null],
    });
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllCartons = [];
    this.listOfDisplayCartons = [];
  }
  search(): void {
    this.cartonService
      .getAll(this.searchForm.controls.name.value, this.searchForm.controls.enabled.value)
      .subscribe(cartonRes => {
        this.listOfAllCartons = cartonRes;
        this.listOfDisplayCartons = cartonRes;
      });
  }

  currentPageDataChange($event: Carton[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayCartons = $event;
  }
  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayCartons = this.listOfAllCartons.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayCartons = this.listOfAllCartons;
    }
  }

  stopEdit(): void {
    this.editId = null;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeCarton(carton: Carton) {
    this.stopEdit();
    this.cartonService
      .change(carton)
      .subscribe(res => this.messageService.success(this.i18n.fanyi('message.action.success')));
  }

  handleCreatingCartonModalCancel() {
    this.creatingCartonModalVisible = false;
  }

  handleCreatingCartonModalOk() {
    if (this.creatingCartonForm.valid) {
      console.log(`save carton: ${JSON.stringify(this.creatingCartonForm.value)}`);
      const carton: Carton = this.creatingCartonForm.value;

      this.cartonService.add(carton).subscribe(res => {
        this.creatingCartonModalVisible = false;
        this.messageService.success(this.i18n.fanyi('message.new.complete'));
        this.search();
      });
    } else {
      this.displayFormError(this.creatingCartonForm);
    }
  }
  displayFormError(fromGroup: FormGroup) {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }

  handleCreatingCartonModalOpen() {
    this.creatingCartonForm.reset();
  }

  openCreatingCartonModal() {
    this.creatingCartonModalVisible = true;
  }
}
