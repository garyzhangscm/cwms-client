import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { PageHeaderComponent } from '@delon/abc/page-header';
import { STModule } from '@delon/abc/st';

import { I18nPipe } from '@delon/theme';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions'; 
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzStepsModule } from 'ng-zorro-antd/steps'; 
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { CWMSCommonModule } from '../common/common.module';
 
import { ReportPrinterMaintenanceComponent } from './printer-maintenance/printer-maintenance.component';
import { ReportPrinterTypeMaintenanceComponent } from './printer-type-maintenance/printer-type-maintenance.component';
import { ReportPrinterTypeComponent } from './printer-type/printer-type.component';
import { ReportPrinterComponent } from './printer/printer.component';
import { ReportReportHistoryComponent } from './report-history/report-history.component';
import { ReportReportMaintenanceComponent } from './report-maintenance/report-maintenance.component';
import { ReportReportPreviewComponent } from './report-preview/report-preview.component';
import { ReportReportPrinterConfigurationMaintenanceComponent } from './report-printer-configuration-maintenance/report-printer-configuration-maintenance.component';
import { ReportReportPrinterConfigurationComponent } from './report-printer-configuration/report-printer-configuration.component';
import { ReportRoutingModule } from './report-routing.module';
import { ReportReportComponent } from './report/report.component';

const COMPONENTS: Array<Type<void>> = [
  ReportReportComponent,
  ReportReportHistoryComponent,
  ReportReportPreviewComponent,
  ReportReportMaintenanceComponent,
  ReportReportPrinterConfigurationComponent,
  ReportReportPrinterConfigurationMaintenanceComponent,
  ReportPrinterComponent,
  ReportPrinterMaintenanceComponent,
  ReportPrinterTypeComponent,
  ReportPrinterTypeMaintenanceComponent];

@NgModule({
  imports: [
    NzDescriptionsModule,
    ReportRoutingModule,
    NzStepsModule,
    NzFormModule,
    FormsModule, 
    ReactiveFormsModule, 
    I18nPipe,
    NzSpinModule ,
    NzButtonModule,
    NzSelectModule, 
    PageHeaderComponent,
    STModule,
    NzDropDownModule ,
    NzCardModule ,
    NzDividerModule,    
    NzBreadCrumbModule ,
    NzTableModule ,
    NzListModule ,
    CommonModule,
    NzUploadModule ,
    CWMSCommonModule,
    NgxExtendedPdfViewerModule,
    NzInputNumberModule ,
  ],
  declarations: COMPONENTS,
})
export class ReportModule { }
