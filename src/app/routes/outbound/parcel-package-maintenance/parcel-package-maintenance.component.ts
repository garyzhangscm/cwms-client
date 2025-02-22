import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN,  _HttpClient } from '@delon/theme'; 
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile,  } from 'ng-zorro-antd/upload';

import { Carrier } from '../../transportation/models/carrier';
import { CarrierService } from '../../transportation/services/carrier.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Order } from '../models/order'; 
import { ParcelPackage } from '../models/parcel-package';
import { ParcelPackageStatus } from '../models/parcel-package-status.enum';
import { OrderService } from '../services/order.service';
import { ParcelPackageService } from '../services/parcel-package.service';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

@Component({
    selector: 'app-outbound-parcel-package-maintenance',
    templateUrl: './parcel-package-maintenance.component.html',
    styleUrls: ['./parcel-package-maintenance.component.less'],
    standalone: false
})
export class OutboundParcelPackageMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  pageTitle = '';
  stepIndex = 0;
  currentOrder!: Order;  
  fileList: NzUploadFile[] = [];

  shippingLabelUploadUrl = ``;
  previewImage: string | undefined = '';
  previewVisible = false;
  currentParcelPackage! : ParcelPackage;
  carrierOptions: any[] = [];
  selectedCarrier = "";
  carriers: Carrier[] = [];
   
  acceptUploadedFileTypes = '.pdf,.png,.jpg';
  
  isSpinning = false;
  constructor( 
    private activatedRoute: ActivatedRoute,  
    private orderService: OrderService, 
    private warehouseService: WarehouseService,
    private parcelPackageService: ParcelPackageService,
    private messageService: NzMessageService,
    private carrierService: CarrierService,
    private router: Router
  ) {
    this.pageTitle = this.i18n.fanyi("parcel-package");
    
    this.currentParcelPackage = { 
    
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
    
      trackingCode: "",
      trackingUrl: "",
      status: ParcelPackageStatus.REQUESTED,
      statusDescription: "",
      shipmentId: "", 
    
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    
      carrier: "",
      service: "",
    
      deliveryDays: 0,
      rate: 0,
    
      labelResolution: 0,
      labelSize: "",
      labelUrl: "",
    
      insurance: "0",               
    }
  }

  ngOnInit(): void { 

    this.fileList = [];
    this.activatedRoute.queryParams.subscribe(params => {
      
      this.isSpinning = true;
      if (params['id']) {
        this.orderService.getOrder(params['id']).subscribe({
          next: (orderRes) => {
            this.currentOrder = orderRes;
            this.isSpinning = false;
            this.shippingLabelUploadUrl = `outbound/parcel/packages/${this.currentOrder.warehouseId}/${this.currentOrder.id}/labels/upload/`;
            this.fileList = []; 
            
          }, 
          error: () => this.isSpinning = false
        })
      }
    });
    
    
    this.stepIndex = 0;
    
    this.loadCarriers();

  }
  
 
  loadCarriers() {
    this.carrierOptions = [];
    this.carrierService.loadCarriers(true).subscribe({

      next: (carrierRes) => {
        
        this.carriers = carrierRes.filter(
          carrier => carrier.enabled == true
        );

        this.carriers.forEach(
          carrier => {
            let serviceLevels : any[] = [];
            carrier.carrierServiceLevels.forEach(
              carrierServiceLevel => {
                serviceLevels = [...serviceLevels, 
                    {
                      value: carrierServiceLevel.name,
                      label: carrierServiceLevel.name,
                      isLeaf: true
                    }
                ]
              }
            );
            this.carrierOptions = [...this.carrierOptions, 
            { 
              value: carrier.name,
              label: carrier.name,
              children: serviceLevels
            }]
          }
        )
      }
    })
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    // before go to the confirm page, let's setup the
    // tracking url and label download url
    if (this.stepIndex == 0) {
      this.setupParcelPackage();
    }
    this.stepIndex += 1;
  }
  setupParcelPackage() { 
    if (this.selectedCarrier) {
      console.log(`get carrier information ${this.selectedCarrier}`);
      // get the selected carrier id and service level id 
      // then get the carrier / service level from the id
      let carrierInformationArray : string[] = [];
      let carrierInformation : string = this.selectedCarrier.toString();
      carrierInformationArray = carrierInformation.split(",");

      this.currentParcelPackage.carrier = carrierInformationArray[0];
      if (carrierInformationArray.length > 1) {
         this.currentParcelPackage.service = carrierInformationArray[1];
      }
      
      // setup the tracking number query URL from the carrier
      if (this.currentParcelPackage.trackingCode != "") {

        this.carriers.filter(
          carrier => carrier.name == this.currentParcelPackage.carrier &&
                     carrier.trackingInfoUrl != ""
        ).forEach(
          carrier => this.currentParcelPackage.trackingUrl = `${carrier.trackingInfoUrl}${this.currentParcelPackage.trackingCode}`
        )
      }
    }
    // get the label download URL based on the file name
    // at this moment, we only allow one documetn per package
    this.fileList.forEach(file => { 
      this.currentParcelPackage.labelUrl = this.getFileUrl(file.name);
    });

    // setup the shipment id as tracking number.
    // shipment id is the business key of the package
    this.currentParcelPackage.shipmentId = this.currentParcelPackage.trackingCode;


  }
  confirm(): void {

    this.isSpinning = true;  
    this.parcelPackageService.addParcelPackage(this.currentOrder.id!, this.currentParcelPackage!)
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
  handlePreview = async (file: NzUploadFile): Promise<void> => {
    
    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
  };

  getFileUrl(fileName: string) : string {
    return `${environment.api.baseUrl}/outbound/orders/${this.currentOrder.warehouseId}/${this.currentOrder.id}/documents/preview/${fileName}`; 
     
  }
  readyForConfirm() {
    return this.currentParcelPackage.length > 0 && 
            this.currentParcelPackage.length > 0 && 
            this.currentParcelPackage.width > 0 && 
            this.currentParcelPackage.weight > 0 && 
            this.selectedCarrier != "" && 
            this.currentParcelPackage.trackingCode != ""
  }
 
}
