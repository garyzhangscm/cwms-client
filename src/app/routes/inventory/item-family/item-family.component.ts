import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { ItemFamily } from '../models/item-family';
import { ItemFamilyService } from '../services/item-family.service';

@Component({
    selector: 'app-inventory-item-family',
    templateUrl: './item-family.component.html',
    styleUrls: ['./item-family.component.less'],
    standalone: false
})
export class InventoryItemFamilyComponent implements OnInit {

  listOfColumns: Array<ColumnItem<ItemFamily>> = [
    {
      name: 'item-family.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ItemFamily, b: ItemFamily) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item-family.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ItemFamily, b: ItemFamily) => this.utilService.compareNullableString(a.description, b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'item-family.item-count',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ItemFamily, b: ItemFamily) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
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

  // Table data for display
  itemFamilies: ItemFamily[] = [];
  listOfDisplayItemFamilies: ItemFamily[] = [];


  // editable cell
  editId!: number;
  editCol!: string | null;

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement!: ElementRef;

  displayOnly = false;
  constructor(
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/inventory/item-family").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );            
  
  }

  search(refresh: boolean = false): void {
    this.itemFamilyService.loadItemFamilies(refresh).subscribe(itemFamilyRes => {
      this.itemFamilies = itemFamilyRes;
      this.listOfDisplayItemFamilies = itemFamilyRes;


    });
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
    this.listOfDisplayItemFamilies!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: ItemFamily[]): void {
    this.listOfDisplayItemFamilies! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayItemFamilies!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayItemFamilies!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }


  removeSelectedItemFamilies(): void {
    // make sure we have at least one checkbox checked
    const selectedItemFamilies = this.getSelectedItemFamilies();
    if (selectedItemFamilies.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.item-family.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.itemFamilyService.removeItemFamilies(selectedItemFamilies).subscribe(res => {
            console.log('selected item families are removed');
            this.refresh();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedItemFamilies(): ItemFamily[] {
    const selectedItemFamilies: ItemFamily[] = [];
    this.itemFamilies.forEach((itemFamily: ItemFamily) => {
      if (this.setOfCheckedId.has(itemFamily.id!)) {
        selectedItemFamilies.push(itemFamily);
      }
    });
    return selectedItemFamilies;
  }

  startEdit(id: number, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeItemFamily(itemFamily: ItemFamily): void {
    this.itemFamilyService
      .changeItemFamily(itemFamily)
      .subscribe(res => this.messageService.success(this.i18n.fanyi('message.modify.success')));
  }

  @HostListener('window:click', ['$event'])
  handleClick(e: MouseEvent): void {
    if (this.editId && this.inputElement && this.inputElement.nativeElement !== e.target) {
      this.editId = -1;
    }
  }

  ngOnInit(): void {
    this.search(true);
  }
  clearSessionItemFamily(): void {
    sessionStorage.removeItem('item-family-maintenance.item-family');
  }
  refresh(): void {
    this.search(true);
  }
}
