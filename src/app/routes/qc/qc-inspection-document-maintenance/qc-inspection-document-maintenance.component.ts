

import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadFile, NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { UtilService } from '../../util/services/util.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QcInspectionRequestType } from '../models/qc-inspection-request-type';
import { QCInspectionResult } from '../models/qc-inspection-result';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';


const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });


@Component({
    selector: 'app-qc-qc-inspection-document-maintenance',
    templateUrl: './qc-inspection-document-maintenance.component.html',
    standalone: false
})
export class QcQcInspectionDocumentMaintenanceComponent implements OnInit {
  
  currentQCInspectionRequest: QcInspectionRequest; 
  
  isSpinning = false; 
  pageTitle: string;

  imageFileUploadUrl = '';
  fileList: NzUploadFile[] = [];
  
  acceptUploadedFileTypes = '.jpg,.svg,.png';
  previewImage: string | undefined = '';
  previewVisible = false;
  
  constructor(private http: _HttpClient, 
    private qcInspectionRequestService: QcInspectionRequestService, 
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private titleService: TitleService,
    private warehouseService: WarehouseService, 
    private utilService: UtilService,
    private messageService: NzMessageService,
    private router: Router,) { 
      this.currentQCInspectionRequest = {        
        number: "", 
        documentUrls: "",
        warehouseId: this.warehouseService.getCurrentWarehouse().id,         
        inventories: [],
        qcInspectionResult: QCInspectionResult.PENDING,
        qcInspectionRequestItems: [],
        type: QcInspectionRequestType.BY_INVENTORY
      }
      this.pageTitle = this.i18n.fanyi('qc.document-maintenance');
    }

  ngOnInit(): void { 
    
    this.fileList = [];
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {

        this.imageFileUploadUrl = `inventory/qc-inspection-requests/${params['id']}/documents`;

        this.isSpinning = true;
        this.qcInspectionRequestService.getQCInspectionRequest(
          params['id']
        ).subscribe({
          next: (qcInspectionRequest) => {
             this.currentQCInspectionRequest = qcInspectionRequest; 
             this.loadDocuments();
             this.isSpinning = false;
          }
        });
      }
    });
  }
  
  loadDocuments() {
    if(!this.currentQCInspectionRequest.documentUrls || this.currentQCInspectionRequest.documentUrls.trim().length == 0) {

      this.currentQCInspectionRequest.documentUrls = "";
      this.fileList = []; 
    }
    else {


      this.currentQCInspectionRequest.documentUrls.split(",").forEach(
        documentUrl => {
          
        this.fileList = [
          ...this.fileList,
          {
            uid: documentUrl,
            name: documentUrl,
            status: 'done',
            response: '', // custom error message to show
            url: this.getDocumentUrl(documentUrl)
          }
        ];
        }
      );
    }
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

    this.qcInspectionRequestService.changeQCInspectionDocument(this.currentQCInspectionRequest).subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/qc/inspection?number=${this.currentQCInspectionRequest?.number}`);
        }, 500);
      },
      error: () => {
        this.isSpinning = false;
      },
    }); 
  }
  
  loadDocumentUrls(qcInspectionRequest: QcInspectionRequest) {
    qcInspectionRequest.documentUrls = this.fileList.map(file => file.name).join(",");
  }

  getDocumentUrl(documentFileName: string) : string {
     
    
    return `${environment.api.baseUrl}inventory/qc-inspection-requests/documents/${this.warehouseService.getCurrentWarehouse().id}/${this.currentQCInspectionRequest?.id}/${this.utilService.encodeValue(documentFileName.trim())}`;

    
  }
   
  handleUploadChange(info: NzUploadChangeParam): void { 
    console.log(`handleUploadChange: ${JSON.stringify(info)}`)
    if (info.file.status === 'done') {
      
      let url = this.getDocumentUrl(info.file.name);
      
 
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
      this.loadDocumentUrls(this.currentQCInspectionRequest);

    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
      this.fileList = this.fileList.filter(file => file.uid !== info.file.uid);
    }
    else if (info.file.status === 'removed') {
      this.fileList = this.fileList.filter(file => file.uid !== info.file.uid);
      
      this.loadDocumentUrls(this.currentQCInspectionRequest);
      

    }
    
  } 
}
