import { Component, Inject, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { WorkOrderQcSample } from '../models/work-order-qc-sample';
import { ProductionLineAssignmentService } from '../services/production-line-assignment.service';
import { WorkOrderQcSampleService } from '../services/work-order-qc-sample.service';
import { WorkOrderService } from '../services/work-order.service';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

@Component({
  selector: 'app-work-order-work-order-qc-sample-maintenance',
  templateUrl: './work-order-qc-sample-maintenance.component.html',
})
export class WorkOrderWorkOrderQcSampleMaintenanceComponent implements OnInit {

  currentWorkOrderQcSample: WorkOrderQcSample;
  currentProductionLineAssignment?: ProductionLineAssignment;
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

  authToken: string | undefined | null;
  
  constructor(private http: _HttpClient, private injector: Injector, 
    private workOrderQcSampleService: WorkOrderQcSampleService, 
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private productionLineAssignmentService: ProductionLineAssignmentService,
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private workOrderService: WorkOrderService,
    private messageService: NzMessageService,
    private router: Router,) { 
      this.currentWorkOrderQcSample = {        
        number: "", 
        imageUrls: "",
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        
      }
      this.pageTitle = this.i18n.fanyi('work-order.qc-sample-maintenance');
      
      this.authToken = this.tokenSrv.get()?.token;
    }

    
  private get tokenSrv(): ITokenService {
    return this.injector.get(DA_SERVICE_TOKEN);
  }

  
  ngOnInit(): void { 
    
    this.fileList = [];
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.productionLineAssignmentId) {

        this.imageFileUploadUrl = `workorder/qc-samples/${params.productionLineAssignmentId}/images`;

        this.isSpinning = true;
        this.productionLineAssignmentService.getProductionLineAssignment(
          params.productionLineAssignmentId
        ).subscribe({
          next: (productionLineAssignmentRes) => {
            this.currentProductionLineAssignment = productionLineAssignmentRes;
            this.currentWorkOrderQcSample.productionLineAssignment = productionLineAssignmentRes;
            // setup the work order. 
            if ((this.currentProductionLineAssignment.workOrder === undefined || 
                  this.currentProductionLineAssignment.workOrder === null) &&
                  this.currentProductionLineAssignment.workOrderId !== null) {
                    this.workOrderService.getWorkOrder(this.currentProductionLineAssignment!.workOrderId!).subscribe(
                      {
                          next: (workOrderRes) => this.currentProductionLineAssignment!.workOrder = workOrderRes
                      }
                    )
            }
            

            this.workOrderQcSampleService.getWorkOrderQcSamples(params.productionLineAssignmentId).subscribe(
              {
                next: (workOrderQcSampleRes) => {
    
                  // for each assignment, we should only have one qc samples
                  if (workOrderQcSampleRes.length > 0) {
                    this.currentWorkOrderQcSample = workOrderQcSampleRes[0];
                    this.sampleNumberValidateStatus = 'success'; 
                    this.newSample = false;
                    this.loadImages();
                    this.isSpinning = false;
                  }
                  else {
                    
                    this.isSpinning = false;
                  }

                }
              })
          }
        })

        
      }
    });

  }
  
  loadImages() {
    console.log(`start to load images from files ${this.currentWorkOrderQcSample.imageUrls}`);
    if (this.currentWorkOrderQcSample.imageUrls.trim().length == 0) {
      this.fileList = [];
      
    }
    else {

      this.currentWorkOrderQcSample.imageUrls.split(",").forEach(
        imageUrl => {
          
        console.log(`this.getImageUrl(imageUrl) for file ${imageUrl} is ${this.getImageUrl(imageUrl)}`);
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
  }
 
  sampleNumberChange(event: Event) {  
    this.currentWorkOrderQcSample!.number = (event.target as HTMLInputElement).value;
    if (this.currentWorkOrderQcSample!.number) {
      // THE USER input the sample number, let's make sure it is not exists yet
      this.workOrderQcSampleService.getWorkOrderQcSamples(undefined, this.currentWorkOrderQcSample!.number).subscribe({
        next: (workOrderQcSampleRes) => {
          if (workOrderQcSampleRes.length > 0) {
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
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj!);
    }
    this.previewImage = file.url || file.preview;
    this.previewVisible = true;
  };
  
  confirm() { 
    this.isSpinning = true;  

    
    this.workOrderQcSampleService.addWorkOrderQcSample(this.currentWorkOrderQcSample).subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/work-order/work-order?number=${this.currentProductionLineAssignment?.workOrder.number}`);
        }, 500);
      },
      error: () => {
        this.isSpinning = false;
      },
    }); 
  }
  
  loadImageUrls(workOrderQcSample: WorkOrderQcSample) {
    workOrderQcSample.imageUrls = this.fileList.map(file => file.name).join(",");
  }

  getImageUrl(imageFileName: string) : string {
    return `${environment.api.baseUrl}workorder/qc-samples/images/${this.warehouseService.getCurrentWarehouse().id}/${this.currentProductionLineAssignment?.id}/${imageFileName}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;

    
  }
   
  handleUploadChange(info: NzUploadChangeParam): void { 
    console.log(`handleUploadChange: ${JSON.stringify(info)}`)
    if (info.file.status === 'done') {
      
      let url = this.getImageUrl(info.file.name);
      
 
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
      this.loadImageUrls(this.currentWorkOrderQcSample);

    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
      this.fileList = this.fileList.filter(file => file.uid !== info.file.uid);
    }
    else if (info.file.status === 'removed') {
      this.fileList = this.fileList.filter(file => file.uid !== info.file.uid);
      
      this.loadImageUrls(this.currentWorkOrderQcSample);


    }
    
  }

  removeQCExample() {
    if (this.currentWorkOrderQcSample.id) {
      this.isSpinning = true;
      this.workOrderQcSampleService.removeWorkOrderQcSample(this.currentWorkOrderQcSample.id)
      .subscribe({
        next: () => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/work-order/work-order?number=${this.currentProductionLineAssignment?.workOrder.number}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      })
    }
  }

}
