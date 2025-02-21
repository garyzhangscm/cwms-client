import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { DataTransferRequestType } from '../../util/models/data-transfer-request-type';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { ItemSampling } from '../models/item-sampling';
import { ItemSamplingService } from '../services/item-sampling.service';

@Component({
    selector: 'app-inventory-item-sampling',
    templateUrl: './item-sampling.component.html',
    styleUrls: ['./item-sampling.component.less'],
    standalone: false
})
export class InventoryItemSamplingComponent implements OnInit {
  isSpinning = false;
  
 
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , 
    iif: () => this.isChoose('description')  }, 
    { title: this.i18n.fanyi("item"),  index: 'item.name' , 
    iif: () => this.isChoose('itemName')  }, 
    
    { title: this.i18n.fanyi("item"),  index: 'item.description' , 
    iif: () => this.isChoose('itemDescription')  }, 
    
    {
      title: this.i18n.fanyi("images"),
      // renderTitle: 'customTitle',
      render: 'images',
      iif: () => this.isChoose('images'), width: 150
    }, 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("item"), value: 'itemDescription', checked: true },
    { label: this.i18n.fanyi("images"), value: 'images', checked: true }, 
     
    
  ];

 
  searchForm!: UntypedFormGroup;
  itemSamplingList: ItemSampling[] = [];
  searchResult = "";
  // list of record with printing in process
  // key: item id
  // value: list of previous item sampling
  mapOfPreviousItemSampling: { [key: number]: ItemSampling[] } = {};
   
   
  displayOnly = false;
  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private itemSamplingService: ItemSamplingService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private companyService: CompanyService,
    private nzImageService: NzImageService,
    private fb: UntypedFormBuilder,
    private userService: UserService,) { 
      userService.isCurrentPageDisplayOnly("/inventory/item-sampling").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );             
    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.item-sampling'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      itemName: [null]
    });
 
    this.activatedRoute.queryParams.subscribe(params => {
      // if we are changing an existing record
      if (params['number']) { 
        this.searchForm!.value.number.setValue(params['number']);
        this.search();
      } 
    });

  }

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }
    
  resetForm(): void {
    this.searchForm.reset();
    this.itemSamplingList = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.itemSamplingService
      .getItemSamplingsForDisplay(this.searchForm.value.number, this.searchForm.value.itemName)
      .subscribe({

        next: (itemSamplingRes) => {
          this.itemSamplingList = itemSamplingRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: itemSamplingRes.length
          });
 

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   

  
  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.searchForm.value.itemName.setValue(selectedItemName);
    
    
  }

  previewSamplingImage(itemSampling : ItemSampling) {
    const images = 
      itemSampling.imageUrls.split(",").map(
        imageUrl => 
          {
            return {
                src: `${environment.api.baseUrl}inventory/item-sampling/images/${itemSampling.warehouseId}/${itemSampling.item?.id}/${itemSampling.number}/${imageUrl}`,
              width: '200px',
              height: '200px',
              alt: 'ng-zorro'
            }
          },
      );
      console.log(`will show images \n ${JSON.stringify(images)}`)

    this.nzImageService.preview(images, { nzZoom: 1.5, nzRotate: 0 });
  
  }
 
  disableItemSampling(itemSampling : ItemSampling) {

    this.isSpinning = true;
    this.itemSamplingService.disableItemSampling(itemSampling).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        
        this.searchForm.value.number.setValue(itemSampling.number);
        this.searchForm.value.itemName.setValue("");

        this.search();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }

  itemSamplingListTableChanged(event: STChange) : void { 
    
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showItemSamplingListTableDetail(event.expand);
    }
  }
  showItemSamplingListTableDetail(itemSampling: ItemSampling) {
    this.itemSamplingService.getPreviousItemSamplingForDisplay(itemSampling.item?.name, itemSampling.item?.id).subscribe(
      {
        next: (itemSamplingRes) => this.mapOfPreviousItemSampling[itemSampling.item!.id!] = itemSamplingRes
      }
    )


  }
}
