import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Carton } from '../models/carton';
import { CartonService } from '../services/carton.service';

@Component({
  selector: 'app-outbound-carton',
  templateUrl: './carton.component.html',
  styleUrls: ['./carton.component.less'],
})
export class OutboundCartonComponent implements OnInit {
  // Form related data and functions
  searchForm!: FormGroup;

  creatingCartonForm!: FormGroup;
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
  editId!: string | null;
  editCol!: string | null;

  constructor(
    private fb: FormBuilder,
    private cartonService: CartonService,
    private i18n: I18NService,

    private messageService: NzMessageService,
  ) {}

  ngOnInit(): void {
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

  changeCarton(carton: Carton): void {
    this.stopEdit();
    this.cartonService
      .change(carton)
      .subscribe(res => this.messageService.success(this.i18n.fanyi('message.action.success')));
  }

  handleCreatingCartonModalCancel(): void {
    this.creatingCartonModalVisible = false;
  }

  handleCreatingCartonModalOk(): void {
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
  displayFormError(fromGroup: FormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }

  handleCreatingCartonModalOpen(): void {
    this.creatingCartonForm.reset();
  }

  openCreatingCartonModal(): void {
    this.creatingCartonModalVisible = true;
  }
}
