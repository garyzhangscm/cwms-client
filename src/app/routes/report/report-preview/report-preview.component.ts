import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient, TitleService } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintingService } from '../../common/services/printing.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ReportOrientation } from '../models/report-orientation.enum';
import { ReportHistoryService } from '../services/report-history.service';

@Component({
  selector: 'app-report-report-preview',
  templateUrl: './report-preview.component.html',
  styleUrls: ['./report-preview.component.less']
})
export class ReportReportPreviewComponent implements OnInit {
  printingInProcess = false;
  printingOrientation: PrintPageOrientation = PrintPageOrientation.Portrait;
  reportOrientation: ReportOrientation = ReportOrientation.LANDSCAPE;

  pageTitle = '';
  pdfUrl = '';
  fileName = '';

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    private printingService: PrintingService,
    private titleService: TitleService,
    private webLocation: Location,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.orientation) {
        console.log(`params.orientation: ${params.orientation}`);
        //this.orientation = params.orientation;
        this.reportOrientation = params.orientation;
        if (this.reportOrientation === ReportOrientation.LANDSCAPE) {
          this.printingOrientation = PrintPageOrientation.Landscape;
        } else {
          this.printingOrientation = PrintPageOrientation.Portrait;
        }
      }

      let url = `${environment.api.baseUrl}/resource/report-histories/download`;

      url = `${url}/${this.warehouseService.getCurrentWarehouse().companyId}`;
      url = `${url}/${this.warehouseService.getCurrentWarehouse().id}`;
      url = `${url}/${params.type}`;
      url = `${url}/${params.fileName}`;

      this.pdfUrl = url;
      this.fileName = params.fileName;
      console.log(`start to get pdf from ${this.pdfUrl}`);
    });
    this.pageTitle = this.i18n.fanyi('report.preview');
    this.titleService.setTitle(this.i18n.fanyi('report.preview'));
  }

  printReport(event: any): void {
    this.printingService.printRemoteFileByPath(
      this.fileName,
      this.pdfUrl,
      event.printerIndex,
      event.physicalCopyCount,
      this.printingOrientation
    );
    this.messageService.success(this.i18n.fanyi('report.print.printed'));
  }

  previewReport(): void {
    console.log(`priview is not support`);
  }

  download(): void {}

  back(): void {
    if (sessionStorage.getItem('report_previous_page')) {
      const previewPageUrl = sessionStorage.getItem('report_previous_page')!.toString();

      sessionStorage.setItem('report_previous_page', '');
      this.router.navigateByUrl(previewPageUrl);
    } else {
      this.webLocation.back();
    }
  }
}
