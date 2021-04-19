import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { _HttpClient } from '@delon/theme';
import { ReportHistoryService } from '../services/report-history.service';
import { environment } from '@env/environment'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { PrintingService } from '../../common/services/printing.service';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { I18NService } from '@core';
import { ReportOrientation } from '../models/report-orientation.enum';
import { TitleService } from '@delon/theme';
import { Location } from '@angular/common';

@Component({
  selector: 'app-report-report-preview',
  templateUrl: './report-preview.component.html',
  styleUrls: ['./report-preview.component.less'],
})
export class ReportReportPreviewComponent implements OnInit {

  htmlContent = '';
  type = 'HTML';
  pdfUrl = environment.SERVER_URL;
  printingInProcess = false;
  fileName = 'CWMS';
  printingOrientation : PrintPageOrientation = PrintPageOrientation.Portrait;
  reportOrientation : ReportOrientation = ReportOrientation.LANDSCAPE;

  pageTitle = '';

  constructor(private http: _HttpClient, 
    private activatedRoute: ActivatedRoute,
    private reportHistoryService: ReportHistoryService,
    private messageService: NzMessageService,
    private printingService: PrintingService,
    private titleService: TitleService,
    private webLocation: Location,
    private i18n: I18NService,) { }

  ngOnInit(): void { 
    
    this.activatedRoute.queryParams.subscribe(params => {
      
      this.type = params.type;
      if (params.fileName) {
        this.fileName = params.fileName;
      }
      if (params.orientation) {
        console.log(`params.orientation: ${params.orientation}`);
        //this.orientation = params.orientation;
        this.reportOrientation = params.orientation;
        if (this.reportOrientation === ReportOrientation.LANDSCAPE) {
          this.printingOrientation = PrintPageOrientation.Landscape;
        }
        else {
          this.printingOrientation = PrintPageOrientation.Portrait;
        }
      }
      if (params.type === 'PDF') {
        this.pdfUrl = `${environment.SERVER_URL}/resource/report-histories/download/${params.fileName}`;
        //this.pdfUrl = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
        // this.pdfUrl = `${environment.SERVER_URL}/resource/assets/testpdf.pdf`;
        console.log(`start to get pdf from ${this.pdfUrl}`)
      }
      else{
        console.log(`currently we are only support PDF file report`);
          }
    });
    this.pageTitle = this.i18n.fanyi('report.preview');
    this.titleService.setTitle(this.i18n.fanyi('report.preview'));
          

  }

  printReport(event: any) :void{
    this.printingService.printRemoteFile(
        this.fileName, 
        this.pdfUrl, 
        event.printerIndex, 
        event.physicalCopyCount, 
        this.printingOrientation);
    this.messageService.success(this.i18n.fanyi("report.print.printed"));
  }

  previewReport(): void {

    console.log(`priview is not support`);
  }

  download() : void {

  }
  
  back(): void {
    this.webLocation.back();
  }
  

}
