import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Alert } from '../../alert/models/alert';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ABCCategory } from '../models/abc-category';
import { AbcCategoryService } from '../services/abc-category.service';

@Component({
  selector: 'app-common-abc-category',
  templateUrl: './abc-category.component.html',
})
export class CommonAbcCategoryComponent implements OnInit {

  isSpinning = false;

  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [
    
    
    { title: this.i18n.fanyi("name"),  index: 'name' ,  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' ,  }, 
     
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn',   
    },      
  ]; 
  
  
  abcCategories: ABCCategory[] = [];
  searchResult = "";

  
  newABCCategoryModal!: NzModalRef;
  newABCCategoryForm!: FormGroup;

  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService, 
    private abcCategoryService: AbcCategoryService,
    private messageService: NzMessageService,
    private router: Router, 
    private modalService: NzModalService,
    private warehouseService: WarehouseService,
    private fb: FormBuilder,) { }

  ngOnInit(): void { 
    this.search();
  }

  search(): void {
    this.isSpinning = true;
    this.abcCategoryService.loadABCCategories().subscribe({
      next: (abcCategoryRes) => {
        this.abcCategories = abcCategoryRes; 

        this.isSpinning = true;
      }, 
      error: () => this.isSpinning = false
    })
  }

  removeABCCategory(abcCategory : ABCCategory): void{
    this.isSpinning = true;
    this.abcCategoryService.removeABCCategory(abcCategory).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.remove.success"));
        this.search();
      }, 
      error: () => this.isSpinning = false
    })
  }

  
  openAddCategoryModel( 
    tplNewABCCategoryModalTitle: TemplateRef<{}>,
    tplNewABCCategoryModalContent: TemplateRef<{}>,
  ): void { 
 
    this.newABCCategoryForm = this.fb.group({
      abcCategoryName: [null],
      abcCategoryDescription: [null], 

    });
    
    this.newABCCategoryModal = this.modalService.create({
          nzTitle: tplNewABCCategoryModalTitle,
          nzContent: tplNewABCCategoryModalContent,
          nzOkText: this.i18n.fanyi('confirm'),
          nzCancelText: this.i18n.fanyi('cancel'),
          nzMaskClosable: false,
          nzOnCancel: () => {
            this.newABCCategoryModal.destroy();
          },
          nzOnOk: () => { 
            this.addABCCategory();
          },    
          nzWidth: 1000,
    });
    
  } 

  addABCCategory(): void {
    this.isSpinning = true; 
    this.abcCategoryService.addABCCategory({
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      name: this.newABCCategoryForm.controls.abcCategoryName.value,
      description: this.newABCCategoryForm.controls.abcCategoryDescription.value
    }).subscribe({

      next: () => {
        this.messageService.success(this.i18n.fanyi("message.create.success"));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    })

  }
}
