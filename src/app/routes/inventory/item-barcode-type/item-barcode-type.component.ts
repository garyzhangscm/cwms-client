import { Component, HostListener, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { I18NService } from '@core';
import { STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from '../../auth/services/user.service';
import { UnitOfMeasure } from '../../common/models/unit-of-measure';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ItemBarcodeType } from '../models/item-barcode-type';
import { ItemBarcodeTypeService } from '../services/item-barcode-type.service';

@Component({
    selector: 'app-inventory-item-barcode-type',
    templateUrl: './item-barcode-type.component.html',
    styleUrls: ['./item-barcode-type.component.less'],
    standalone: false
})
export class InventoryItemBarcodeTypeComponent implements OnInit {
    // Table data for display
    itemBarcodeTypes: ItemBarcodeType[] = []; 
  
    itemBarcodeTypeTableColumns: STColumn[] = [ 
      
      { title: this.i18n.fanyi("name"),  index: 'name'   }, 
      { title: this.i18n.fanyi("description"),  index: 'description'   },  
      {
        title: this.i18n.fanyi("action"),  
        buttons: [ 
          {
            text: this.i18n.fanyi("remove"),  
            type: 'link',
            click: (_record) => this.remove(_record),
          }
        ],  
      }
    ]; 

    displayOnly = false;
    isSpinning = false;
    
    addItemBarcodeTypeForm!: UntypedFormGroup;
    addItemBarcodeTypeModal!: NzModalRef;
    
    constructor(
      private fb: UntypedFormBuilder,
      private itemBarcodeTypeService: ItemBarcodeTypeService,
      private warehouseService: WarehouseService,
      @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
      private modalService: NzModalService,
      private userService: UserService,
    ) { 
      userService.isCurrentPageDisplayOnly("/inventory/item-barcode-type").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                
    }

  search(): void {
    this.isSpinning = true;
    this.itemBarcodeTypeService.getItemBarcodeTypes().subscribe(
      {
        next: (itemBarcodeTypeRes) => {
          this.isSpinning = false;
          this.itemBarcodeTypes = itemBarcodeTypeRes;
        }, 
        error: () => this.isSpinning = false
      }
    );
  }
    

  ngOnInit(): void {
    this.search();
  }
  
  remove(itemBarcodeType : ItemBarcodeType) {
    this.isSpinning = true;
    this.itemBarcodeTypeService.removeItemBarcodeType(itemBarcodeType.id!)
    .subscribe({
      next: () => {
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false

    })
    
  }

  refresh() {
    this.search();
  }

  
  openAddItemBarcodeTypeModal( 
    tplAddItemBarcodeTypeModalTitle: TemplateRef<{}>,
    tplAddItemBarcodeTypeModalContent: TemplateRef<{}>, 
  ): void {
    
    this.addItemBarcodeTypeForm = this.fb.group({ 
      name: [null],
      description: [null], 
    });
 
    this.addItemBarcodeTypeModal = this.modalService.create({
      nzTitle: tplAddItemBarcodeTypeModalTitle,
      nzContent: tplAddItemBarcodeTypeModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.addItemBarcodeTypeModal.destroy(); 
      },
      nzOnOk: () => {
        this.addItemBarcodeType( 
          this.addItemBarcodeTypeForm.controls.name.value,
          this.addItemBarcodeTypeForm.controls.description.value,
        );
        return false;
      },

      nzWidth: 1000,
    });
  }

  addItemBarcodeType(name: string, description: string) {
    const itemBarcodeType : ItemBarcodeType = {
      name: name,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      description: description
    }
    this.itemBarcodeTypeService.addItemBarcodeType(itemBarcodeType)
    .subscribe({
      next: () => {
        this.addItemBarcodeTypeModal.destroy(); 
        this.search();
      }
      
    })
  }

}
