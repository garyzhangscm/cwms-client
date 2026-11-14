import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { ItemSampling } from '../models/item-sampling';
import { ItemSamplingService } from '../services/item-sampling.service';
import { ItemService } from '../services/item.service';


const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

  
@Component({
    selector: 'app-inventory-item-sampling-maintenance',
    templateUrl: './item-sampling-maintenance.component.html',
    standalone: false
})
export class InventoryItemSamplingMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  currentItemSampling: ItemSampling; 
  newSample = true;
  sampleNumberValidateStatus = 'warning'; 
  stepIndex = 0; 
  isSpinning = false; 
  pageTitle: string;

  imageFileUploadUrl = '';
  fileList: NzUploadFile[] = [];
  acceptUploadedFileTypes = '.jpg,.svg,.png';
  previewImage: string | undefined = '';
  previewVisible = false;
  
  constructor(private http: _HttpClient,  
    private activatedRoute: ActivatedRoute, 
    private itemSamplingService: ItemSamplingService,
    private titleService: TitleService,
    private warehouseService: WarehouseService, 
    private messageService: NzMessageService,
    private itemService: ItemService,
    private router: Router,) { 
      this.currentItemSampling = {        
        number: "", 
        imageUrls: "",
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
 
        description: "", 
        enabled: true,
        
      }
      this.pageTitle = this.i18n.fanyi('item-sampling');
    }

  ngOnInit(): void { 
    this.newSample = true;
    
    this.fileList = [];
    this.activatedRoute.queryParams.subscribe(params => {
      // if we are changing an existing record
      if (params['id']) {


        this.isSpinning = true;
        this.itemSamplingService.getItemSampling(
          params['id']
        ).subscribe({
          next: (itemSamplingRes) => {
            this.imageFileUploadUrl = `inventory/item-sampling/${itemSamplingRes.item?.id}/${itemSamplingRes.number}/images`;

            this.newSample = false;
            this.isSpinning = false;
            this.currentItemSampling = itemSamplingRes;  
            this.sampleNumberValidateStatus = 'success'; 
            this.loadImages();
          }
        })

      } 
    });

  }
  
  loadImages() {
    this.currentItemSampling.imageUrls.split(",").forEach(
      imageUrl => {
        
      this.fileList = [
        ...this.fileList,
        {
          uid: imageUrl,
          name: imageUrl,
          status: 'done',
          response: '', // custom error message to show
          url: this.getImageUrl(imageUrl)
        }
      ];
      }
    )
  }
 
  sampleNumberChange(event: Event) {  
    this.currentItemSampling!.number = (event.target as HTMLInputElement).value;
    if (this.currentItemSampling!.number) {
      // THE USER input the sample number, let's make sure it is not exists yet
      this.itemSamplingService.getItemSamplings(this.currentItemSampling!.number).subscribe({
        next: (itemSamplingRes) => {
          if (itemSamplingRes.length > 0) {
            // the order is already exists 
            this.sampleNumberValidateStatus = 'numberExists'
          }
        }
      })
      this.sampleNumberValidateStatus = 'success'
    }
    else {
      this.sampleNumberValidateStatus = 'required'
    }
  }
  
  previousStep() {
    this.stepIndex--;
  }
  nextStep() {
    if (this.passValidation()) {

      this.stepIndex++;
    }
  }
  passValidation() : boolean {

    if (this.stepIndex === 0) {
      console.log(`this.sampleNumberValidateStatus: ${this.sampleNumberValidateStatus}`)
      return this.sampleNumberValidateStatus === 'success';
    }

    return true;
  }
  handlePreview = async (file: NzUploadFile) => {
    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };
  
  confirm() { 
    this.isSpinning = true;  
    if (this.newSample) {
      this.itemSamplingService.addItemSampling(this.currentItemSampling).subscribe({
        next: () => {
  
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/item-sampling?number=${this.currentItemSampling.number}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 

    }
    else {
      this.itemSamplingService.changeItemSampling(this.currentItemSampling).subscribe({
        next: () => {
  
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/item-sampling?number=${this.currentItemSampling.number}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 

    }

    
  }
  
  loadImageUrls(itemSampling: ItemSampling) {
    itemSampling.imageUrls = this.fileList.map(file => file.name).join(",");
  }

  getImageUrl(imageFileName: string) : string {
    if (this.newSample) {
      return `${environment.api.baseUrl}inventory/item-sampling/images/${this.warehouseService.getCurrentWarehouse().id}/${this.currentItemSampling.item?.id}/${imageFileName}`;

    }
    else {
      return `${environment.api.baseUrl}inventory/item-sampling/images/${this.warehouseService.getCurrentWarehouse().id}/${this.currentItemSampling.item?.id}/${this.currentItemSampling.number}/${imageFileName}`;

    }
   
    
  }
   
  handleUploadChange(info: NzUploadChangeParam): void { 
    
    if (info.file.status === 'done') {
      
      let url = this.getImageUrl(info.file.name); 

      if (!this.fileList.some(file => file.name == info.file.name)) {
 
        this.fileList = [
          ...this.fileList,
          {
            uid: info.file.uid,
            name: info.file.name,
            status: info.file.status,
            response: '', // custom error message to show
            url: url
          }
        ]; 
      }
 
      this.loadImageUrls(this.currentItemSampling);

    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
      this.fileList = this.fileList.filter(file => file.uid !== info.file.uid);
    }
    else if (info.file.status === 'removed') {
      this.fileList = this.fileList.filter(file => file.uid !== info.file.uid);
      // we will not remove the image file on the server side at this moment.
      // instead we will clear the image files when we save the result
      // this.removeItemSamplingImage(info.file.name);
      
      this.loadImageUrls(this.currentItemSampling);


    }
    
  }
  removeItemSamplingImage(fileName: string) {
    if (this.newSample) {
      this.itemSamplingService.removeItemSamplingImageByItemId(this.currentItemSampling.item!.id!, fileName).subscribe({

        next: () => console.log(`file ${fileName} for item ${this.currentItemSampling.item!.id!} removed`)

      })
    }
    else {
      this.itemSamplingService.removeItemSamplingImageByItemIdAndNumber(this.currentItemSampling.item!.id!,
        this.currentItemSampling.number, fileName).subscribe({

        next: () => console.log(`file ${fileName} for item ${this.currentItemSampling.item!.id!}, item sampling number ${this.currentItemSampling.number} removed`)

      })

    }
  }

  removeQCExample() {
    if (this.currentItemSampling.id) {
      this.isSpinning = true;
      this.itemSamplingService.removeItemSampling(this.currentItemSampling.id)
      .subscribe({
        next: () => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/item-sampling?number=${this.currentItemSampling?.number}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      })
    }
  }

  
  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe({
      next:(itemRes) => {
        if (itemRes.length === 1) {
          this.currentItemSampling.item = itemRes[0];
        }
      }
    })
    
    
  }

  itemNameBlur(event: Event): void {
    const itemName: string = (event.target as HTMLInputElement).value;
    console.log(`item name is changed to ${itemName}`);
    // Load the item informaiton when the name is changed
    if (this.currentItemSampling.item == null ||
        itemName !== this.currentItemSampling.item!.name) {
      // clear the file upload url when we changed the item.
      // we will reset the url once we get the new item's information
      this.imageFileUploadUrl = '';
      if (itemName.length === 0) {
        // item is chagned to empty, let's clear the item
        this.currentItemSampling.item = undefined;
      } else {
        
          this.itemService.getItems(itemName).subscribe({
            next:(itemRes) => {
              if (itemRes.length === 1) {
                this.currentItemSampling.item = itemRes[0];
                
                this.imageFileUploadUrl = `inventory/item-sampling/${this.currentItemSampling.item?.id}/images`;
              }
            }
          })
      }
    }
  }


} 

