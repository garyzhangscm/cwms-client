import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Mould } from '../models/mould';
import { MouldService } from '../services/mould.service';

@Component({
    selector: 'app-work-order-mould',
    templateUrl: './mould.component.html',
    styleUrls: ['./mould.component.less'],
    standalone: false
})
export class WorkOrderMouldComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<Mould>> = [
    {
      name: 'name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Mould, b: Mould) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Mould, b: Mould) => this.utilService.compareNullableString(a.description, b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'cavity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Mould, b: Mould) => this.utilService.compareNullableNumber(a.cavity, b.cavity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },


  ];


  // Form related data and functions
  searchForm!: UntypedFormGroup;
  searchResult = '';


  // Table data for display
  listOfAllMoulds: Mould[] = [];
  listOfDisplayMoulds: Mould[] = [];

  isSpinning = false;


  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder, 
    private titleService: TitleService,
    private mouldService: MouldService,
    private activatedRoute: ActivatedRoute, 
    private userService: UserService,
    private utilService: UtilService,
  ) { 
    userService.isCurrentPageDisplayOnly("/work-order/mould").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                                    
  }
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('mould'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      description: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {
        this.searchForm.value.name.setValue(params['name']);
        this.search();
      }
    });

  }


  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllMoulds = [];
    this.listOfDisplayMoulds = [];
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.mouldService
      .getMoulds(this.searchForm.value.name, this.searchForm.value.description)
      .subscribe(
        mouldRes => {
          this.listOfAllMoulds = mouldRes;
          this.listOfDisplayMoulds = mouldRes;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: mouldRes.length,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }


  currentPageDataChange($event: Mould[]): void {
    this.listOfDisplayMoulds! = $event;
  }

  removeMould(mould: Mould) {
    this.isSpinning = true;
    this.mouldService
      .removeMould(mould)
      .subscribe(
        mouldRes => {
          this.isSpinning = false;
          this.search();
        },
        () => {
          this.isSpinning = false;
        },
      );

  }
}
