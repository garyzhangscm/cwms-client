import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, Observer } from 'rxjs';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Item } from '../models/item';
import { ItemFamily } from '../models/item-family';
import { ItemFamilyService } from '../services/item-family.service';
import { ItemService } from '../services/item.service';

@Component({
  selector: 'app-inventory-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.less']
})
export class InventoryItemComponent implements OnInit {
  listOfColumns: ColumnItem[] = [
    {
      name: 'thumbnail',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '120px'
    },
    {
      name: 'name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareNullableString(a.name, b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '120px'
    },
    {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareNullableString(a.description, b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '120px'
    },
    {
      name: 'client',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareNullableObjField(a.client, b.client, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '120px'
    },
    {
      name: 'item-family',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareNullableObjField(a.itemFamily, b.itemFamily, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '120px'
    },
    {
      name: 'unit-cost',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareNullableNumber(a.unitCost, b.unitCost),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '120px'
    },
    {
      name: 'allowAllocationByLPN',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.allowAllocationByLPN, b.allowAllocationByLPN),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false }
      ],
      filterFn: (list: boolean[], item: Item) => list.some(allowAllocationByLPN => item.allowAllocationByLPN === allowAllocationByLPN),
      showFilter: true,
      width: '150px'
    },
    {
      name: 'allocationRoundUpStrategyType',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) =>
        this.utilService.compareNullableString(a.allocationRoundUpStrategyType?.toString(), b.allocationRoundUpStrategyType?.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '150px'
    },
    {
      name: 'allocationRoundUpStrategyValue',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) =>
        this.utilService.compareNullableNumber(a.allocationRoundUpStrategyValue, b.allocationRoundUpStrategyValue),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '150px'
    },
    {
      name: 'trackingVolumeFlag',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingVolumeFlag, b.trackingVolumeFlag),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false }
      ],
      filterFn: (list: boolean[], item: Item) => list.some(trackingVolumeFlag => item.trackingVolumeFlag === trackingVolumeFlag),
      showFilter: true,
      width: '150px'
    },
    {
      name: 'trackingLotNumberFlag',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingLotNumberFlag, b.trackingLotNumberFlag),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false }
      ],
      filterFn: (list: boolean[], item: Item) => list.some(trackingLotNumberFlag => item.trackingLotNumberFlag === trackingLotNumberFlag),
      showFilter: true,
      width: '150px'
    },
    {
      name: 'trackingManufactureDateFlag',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingManufactureDateFlag, b.trackingManufactureDateFlag),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false }
      ],
      filterFn: (list: boolean[], item: Item) =>
        list.some(trackingManufactureDateFlag => item.trackingManufactureDateFlag === trackingManufactureDateFlag),
      showFilter: true,
      width: '150px'
    },
    {
      name: 'shelfLifeDays',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareNullableNumber(a.shelfLifeDays, b.shelfLifeDays),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      width: '150px'
    },
    {
      name: 'trackingExpirationDateFlag',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Item, b: Item) => this.utilService.compareBoolean(a.trackingExpirationDateFlag, b.trackingExpirationDateFlag),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false }
      ],
      filterFn: (list: boolean[], item: Item) =>
        list.some(trackingExpirationDateFlag => item.trackingExpirationDateFlag === trackingExpirationDateFlag),
      showFilter: true,
      width: '150px'
    }
  ];
  expandSet = new Set<number>();

  scrollX = '100vw';
  isSpinning = false;

  // Select control for clients and item families
  availableClients: Client[] = [];
  itemFamilies: Array<{ label: string; value: string }> = [];
  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  items: Item[] = [];
  listOfDisplayItems: Item[] = [];

  // editable cell
  editId!: string | null;
  editCol!: string | null;

  searching = false;
  searchResult = '';

  imageUploadDestination = '';
  uploadImageModal!: NzModalRef;
  uploadingImageItem!: Item;
  imageServerUrl = environment.api.baseUrl;
  imageUploading = false;
  uploadedImage = '';

  fallbackImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg==';

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private clientService: ClientService,
    private itemFamilyService: ItemFamilyService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.item'));
    // initiate the search form
    this.searchForm = this.fb.group({
      clientId: [null],
      taggedItemFamilies: [null],
      itemName: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.itemName.setValue(params.name);
        this.search();
      }
    });

    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });
    this.itemFamilyService.loadItemFamilies().subscribe((itemFamilyList: ItemFamily[]) => {
      itemFamilyList.forEach(itemFamily => this.itemFamilies.push({ label: itemFamily.description, value: itemFamily.id!.toString() }));
    });
    console.log(`imageServerUrl: ${this.imageServerUrl}`);
  }

  resetForm(): void {
    this.searchForm.reset();
    this.items = [];
    this.listOfDisplayItems = [];
  }
  search(): void {
    this.isSpinning = true; 
    this.itemService
      .getItems(this.searchForm.value.itemName, undefined, this.searchForm.value.taggedItemFamilies, 
        undefined,undefined, this.searchForm.value.clientId)
      .subscribe(
        itemRes => {
          this.items = itemRes;
          this.listOfDisplayItems = itemRes;

          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: itemRes.length
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      );
  }

  currentPageDataChange($event: Item[]): void {
    this.listOfDisplayItems = $event;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  showItemPackageType(item: Item): void {
    // When we expand to show the item package type, load the details of the item package type
  }

  removeItem(item: Item): void {
    // make sure we have at least one checkbox checked

    this.modalService.confirm({
      nzTitle: this.i18n.fanyi('modal.delete.header.title'),
      nzContent: this.i18n.fanyi('modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkDanger: true,
      nzOnOk: () => {
        this.itemService.removeItem(item).subscribe(res => {
          this.messageService.success(this.i18n.fanyi('message.remove.success'));
          this.search();
        });
      },
      nzCancelText: this.i18n.fanyi('cancel'),
      nzOnCancel: () => console.log('Cancel')
    });
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }

  openImageViewer(item: Item, tplUploadImagesModalTitle: TemplateRef<{}>, tplUploadImagesModalContent: TemplateRef<{}>): void {
    this.uploadingImageItem = item;
    this.imageUploadDestination = `inventory/items/${item.id}/images/upload`;
    // show the model
    this.uploadedImage = '';
    this.uploadImageModal = this.modalService.create({
      nzTitle: tplUploadImagesModalTitle,
      nzContent: tplUploadImagesModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.uploadImageModal.destroy();
        // refresh after cancel
        this.search();
      },
      nzOnOk: () => {
        this.uploadImageModal.destroy();
        // refresh after cancel
        this.search();
      },
      nzWidth: 1000
    });
  }

  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]) => {
    return new Observable((observer: Observer<boolean>) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        this.messageService.error('You can only upload JPG file!');
        observer.complete();
        return;
      }
      const isLt10M = file.size! / 1024 / 1024 < 10;
      if (!isLt10M) {
        this.messageService.error('Image must smaller than 10MB!');
        observer.complete();
        return;
      }
      observer.next(isJpgOrPng && isLt10M);
      observer.complete();
    });
  };

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result!.toString()));
    reader.readAsDataURL(img);
  }

  handleChange(info: { file: NzUploadFile }): void {
    switch (info.file.status) {
      case 'uploading':
        this.imageUploading = true;
        break;
      case 'done':
        this.messageService.success(`${info.file.name} file uploaded successfully`);
        // Get this url from response in real world.
        this.getBase64(info.file!.originFileObj!, (img: string) => {
          this.imageUploading = false;
          this.uploadedImage = img;
        });
        break;
      case 'error':
        this.messageService.error(`${info.file.name} file upload failed.`);
        this.imageUploading = false;
        break;
    }
  }


  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("thumbnail"), type: 'img',index: 'thumbnailUrl', iif: () => this.isChoose('thumbnail'), },
    { title: this.i18n.fanyi("name"), index: 'name', iif: () => this.isChoose('name'), },
    { title: this.i18n.fanyi("description"), index: 'description', iif: () => this.isChoose('description'), },
    { title: this.i18n.fanyi("client"), index: 'client.name', iif: () => this.isChoose('client'), },
    { title: this.i18n.fanyi("item-family"), index: 'itemFamily.name', iif: () => this.isChoose('item-family'), },
    { title: this.i18n.fanyi("unit-cost"), index: 'unitCost', iif: () => this.isChoose('unit-cost'), },
    { title: this.i18n.fanyi("allowAllocationByLPN"), index: 'allowAllocationByLPN', iif: () => this.isChoose('allowAllocationByLPN'), },
    { title: this.i18n.fanyi("allocationRoundUpStrategyType"), index: 'allocationRoundUpStrategyType', iif: () => this.isChoose('allocationRoundUpStrategyType'), },
    { title: this.i18n.fanyi("allocationRoundUpStrategyValue"), index: 'allocationRoundUpStrategyValue', iif: () => this.isChoose('allocationRoundUpStrategyValue'), },
    { title: this.i18n.fanyi("trackingVolumeFlag"), index: 'trackingVolumeFlag', iif: () => this.isChoose('trackingVolumeFlag'), },
    { title: this.i18n.fanyi("trackingLotNumberFlag"), index: 'trackingLotNumberFlag', iif: () => this.isChoose('trackingLotNumberFlag'), },
    { title: this.i18n.fanyi("trackingManufactureDateFlag"), index: 'trackingManufactureDateFlag', iif: () => this.isChoose('trackingManufactureDateFlag'), },
    { title: this.i18n.fanyi("shelfLifeDays"), index: 'shelfLifeDays', iif: () => this.isChoose('shelfLifeDays'), },
    { title: this.i18n.fanyi("trackingExpirationDateFlag"), index: 'trackingExpirationDateFlag', iif: () => this.isChoose('trackingExpirationDateFlag'), },
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',
      render: 'actionColumn',
      fixed: 'right',width: 110, 
    },
  ];
  customColumns = [

    { label: this.i18n.fanyi("thumbnail"), value: 'thumbnail', checked: true },
    { label: this.i18n.fanyi("name"), value: 'name', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("client"), value: 'client', checked: true },
    { label: this.i18n.fanyi("item-family"), value: 'item-family', checked: true },
    { label: this.i18n.fanyi("unit-cost"), value: 'unit-cost', checked: true },
    { label: this.i18n.fanyi("allowAllocationByLPN"), value: 'allowAllocationByLPN', checked: true },
    { label: this.i18n.fanyi("allocationRoundUpStrategyType"), value: 'allocationRoundUpStrategyType', checked: true },
    { label: this.i18n.fanyi("allocationRoundUpStrategyValue"), value: 'allocationRoundUpStrategyValue', checked: true },
    { label: this.i18n.fanyi("trackingVolumeFlag"), value: 'trackingVolumeFlag', checked: true },
    { label: this.i18n.fanyi("trackingLotNumberFlag"), value: 'trackingLotNumberFlag', checked: true },
    { label: this.i18n.fanyi("trackingManufactureDateFlag"), value: 'trackingManufactureDateFlag', checked: true },
    { label: this.i18n.fanyi("shelfLifeDays"), value: 'shelfLifeDays', checked: true },
    { label: this.i18n.fanyi("trackingExpirationDateFlag"), value: 'trackingExpirationDateFlag', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{
    console.log(`my model changed!\n ${JSON.stringify(this.customColumns)}`);
    if (this.st.columns !== undefined) {
      this.st.resetColumns({ emitReload: true });

    }
  }
}
