import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WebMessageAlert } from '../models/web-message-alert';
import { WebMessageAlertService } from '../services/web-message-alert.service';

@Component({
    selector: 'app-alert-web-message-alert',
    templateUrl: './web-message-alert.component.html',
    styles: [
        `.unread {
      font-weight: bold
     }`
    ],
    standalone: false
})
export class AlertWebMessageAlertComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false; 
  currentWebMessageAlert: WebMessageAlert | undefined;
  
  messageModal!: NzModalRef;
  pageTitle = "";

  constructor(private http: _HttpClient, private companySerive: CompanyService, 
    private webMessageAlertService: WebMessageAlertService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private titleService: TitleService,
    private userService: UserService) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void { 
    
    this.titleService.setTitle(this.i18n.fanyi('web-message-alert'));
    this.pageTitle = this.i18n.fanyi('web-message-alert');
  }

  url = `./resource/web-message-alerts`;

  params = { companyId: this.companySerive.getCurrentCompany()!.id, 
    username: this.userService.getCurrentUsername()};
  
  serverDataPreProcess = (data : STData[], rawData?: any) : STData[] => {

    return rawData.data;
  }
    
  @ViewChild('st', { static: false }) private st!: STComponent;
  columns: STColumn[] = [
    { title: 'id', index: 'id', width: 80 }, 
    { title: this.i18n.fanyi('type'),  render: 'alertTypeColumn' },
    { title: this.i18n.fanyi('title'), render: 'titleColumn', width: 500 },
    { title: this.i18n.fanyi('message'), index: 'alert.message' },
    { 
      title: this.i18n.fanyi('action'), 
      render: 'actionColumn',
      width: 350,
      fixed: 'right',
    }
  ];

  markAsRead(webMessageAlert : WebMessageAlert, showSuccessMessage?: boolean) {
    this.isSpinning = true;
    this.webMessageAlertService.readWebMessageAlerts(webMessageAlert.id).subscribe({
      next: () => {
        if (showSuccessMessage) {

          this.messageService.success(this.i18n.fanyi("message.action.success"));
        }
        this.st.reload();
        this.isSpinning = false;

      }, 
      error: () => this.isSpinning = false
    })
  }
 

  openReadMessageModal(
    webMessageAlert : WebMessageAlert,
    tplMessageModalTitle: TemplateRef<{}>,
    tplMessageModalContent: TemplateRef<{}>,
    tplMessageModalFooter: TemplateRef<{}>,
  ): void { 
    this.currentWebMessageAlert = webMessageAlert;

    // show the model
    this.messageModal = this.modalService.create({
      nzTitle: tplMessageModalTitle,
      nzContent: tplMessageModalContent,
      nzFooter: tplMessageModalFooter,

      nzWidth: 1000,
    }); 
    this.markAsRead(webMessageAlert);
  }
  closeMessageModal(): void {
    this.messageModal.destroy(); 
  }
}
