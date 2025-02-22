import { Component,  inject, OnInit,  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Carton } from '../models/carton';
import { CartonService } from '../services/carton.service';

@Component({
    selector: 'app-outbound-carton',
    templateUrl: './carton.component.html',
    styleUrls: ['./carton.component.less'],
    standalone: false
})
export class OutboundCartonComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<Carton>> = [
    {
      name: 'name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Carton, b: Carton) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'length',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Carton, b: Carton) => this.utilService.compareNullableNumber(a.length, b.length),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'width',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Carton, b: Carton) => this.utilService.compareNullableNumber(a.width, b.width),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'height',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Carton, b: Carton) => this.utilService.compareNullableNumber(a.height, b.height),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'fill-rate',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Carton, b: Carton) => this.utilService.compareNullableNumber(a.fillRate, b.fillRate),
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
      sortFn: (a: Carton, b: Carton) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], carton: Carton) => list.some(enabled => carton.enabled === enabled),
      showFilter: true
    },
  ];

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  creatingCartonForm!: UntypedFormGroup;
  // Table data for display
  listOfAllCartons: Carton[] = [];
  listOfDisplayCartons: Carton[] = [];


  searchByEnabledIndeterminate = true;
  creatingCartonModalVisible = false;

  // editable cell
  editId!: number;
  editCol!: string | null;

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private cartonService: CartonService, 
    private userService: UserService,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/carton").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                    
  }

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
      .getAll(this.searchForm.value.name.value, this.searchForm.value.enabled.value)
      .subscribe(cartonRes => {
        this.listOfAllCartons = cartonRes;
        this.listOfDisplayCartons = cartonRes;
      });
  }

  currentPageDataChange($event: Carton[]): void {
    // this.locationGroups = $event;
    this.listOfDisplayCartons = $event;
  }


  stopEdit(): void {
    this.editId = -1;
  }

  startEdit(id: number, col: string, event: MouseEvent): void {
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
  displayFormError(fromGroup: UntypedFormGroup): void {
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
