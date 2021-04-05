import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { _HttpClient } from '@delon/theme';
import { ReportHistoryService } from '../services/report-history.service';
import { environment } from '@env/environment'; 

@Component({
  selector: 'app-report-report-preview',
  templateUrl: './report-preview.component.html',
})
export class ReportReportPreviewComponent implements OnInit {

  htmlContent = '';
  type = 'HTML';
  pdfUrl = environment.SERVER_URL;

  constructor(private http: _HttpClient, 
    private activatedRoute: ActivatedRoute,
    private reportHistoryService: ReportHistoryService) { }

  ngOnInit(): void { 
    
    this.activatedRoute.queryParams.subscribe(params => {
      
      this.type = params.type;
      if (params.type === 'PDF') {
        this.pdfUrl = `${environment.SERVER_URL}/resource/report-histories/download/${params.fileName}`;
        //this.pdfUrl = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
        console.log(`start to get pdf from ${this.pdfUrl}`)
      }
      else if (params.fileName) {        
        console.log(`start to download file ${params.fileName}`);
        this.reportHistoryService.download(params.fileName).subscribe(reportResultFile => 
          {
            console.log(`download file: ${JSON.stringify(reportResultFile)}`);
            this.htmlContent = JSON.stringify(reportResultFile);
          })
          }
    });

  }

}
