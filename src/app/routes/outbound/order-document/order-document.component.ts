import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { UserService } from '../../auth/services/user.service'; 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order';
import { OrderDocument } from '../models/order-document';
import { OrderDocumentService } from '../services/order-document.service';
import { OrderService } from '../services/order.service';

@Component({
    selector: 'app-outbound-order-document',
    templateUrl: './order-document.component.html',
    styleUrls: ['./order-document.component.less'],
    standalone: false
})
export class OutboundOrderDocumentComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentOrder!: Order;  

  fileList: NzUploadFile[] = [];

  orderDocumentUploadUrl = ``;
   
  acceptUploadedFileTypes = '.pdf,.png,.jpg';
  
  isSpinning = false;

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private userService: UserService, 
    private orderService: OrderService, 
    private orderDocumentService: OrderDocumentService,
    private messageService: NzMessageService,
    private router: Router
  ) {
    
    this.pageTitle = i18n.fanyi("order-document");
  }

  ngOnInit(): void {
    this.fileList = [];

    this.activatedRoute.queryParams.subscribe(params => {
      
        this.isSpinning = true;
      if (params.id) {
        this.orderService.getOrder(params.id).subscribe({
          next: (orderRes) => {
            this.currentOrder = orderRes;
            this.isSpinning = false;
            this.orderDocumentUploadUrl = `outbound/orders/${this.currentOrder.warehouseId}/${this.currentOrder.id}/documents/upload/`;
            
            this.fileList = [];
            this.currentOrder.orderDocuments?.forEach(
              orderDocument => {

                this.fileList = [
                  ...this.fileList,                  
                  {
                    uid: orderDocument.id!.toString(),
                    name: orderDocument.fileName,
                    status: 'done',
                    response: '', // custom error message to show
                    url: this.getFileUrl(orderDocument),
                  }
                ]
              }
            ); 
          }, 
          error: () => this.isSpinning = false
        })
      }
    });
    
    
    this.stepIndex = 0;
  }
 
  getFileUrl(orderDocument : OrderDocument) : string {
    if (orderDocument.id) {

      return `${environment.api.baseUrl}/outbound/orders/documents/${orderDocument.id}/download`;
    }
    else {

      return `${environment.api.baseUrl}/outbound/orders/${this.warehouseService.getCurrentWarehouse().id}/${this.currentOrder.id}/documents/download/${orderDocument.fileName}`;
    }
     
  }
 
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm(): void {
    this.isSpinning = true;   
    this.orderDocumentService.saveOrderDocument(this.currentOrder.id!, this.currentOrder.orderDocuments!)
    .subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/outbound/order?number=${this.currentOrder.number}`);
        }, 500);
      }
    })

  }

  handleUploadChange(info: NzUploadChangeParam): void { 
    console.log(`handleUploadChange: ${JSON.stringify(info)}`);

    if (info.file.status === 'done') {
      this.messageService.success(`${info.file.name} ${this.i18n.fanyi('file.upload.success')}`);
 
      // create an new order document structure
      const orderDocument : OrderDocument = {

        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        username: this.userService.getCurrentUsername(),
        fileName: info.file.name
      } 

      if (!this.currentOrder.orderDocuments) {
        this.currentOrder.orderDocuments = [];
      }
      this.currentOrder.orderDocuments = [
        ...this.currentOrder.orderDocuments!,
        orderDocument];

      this.fileList = [
        ...this.fileList,
        {
          uid: info.file.uid,
          name: info.file.name,
          status: info.file.status,
          response: '', // custom error message to show
          url: this.getFileUrl(orderDocument)
        }
      ];
    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
    }
    else if (info.file.status === 'removed') {
      this.currentOrder.orderDocuments = this.currentOrder.orderDocuments?.filter(
        orderDocument => orderDocument.fileName !== info.file.name
      )
    }

    
  }
 

}
