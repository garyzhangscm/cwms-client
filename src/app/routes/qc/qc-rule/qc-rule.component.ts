import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { InboundQcConfiguration } from '../../inbound/models/inbound-qc-configuration';
import { QCRule } from '../models/qc-rule';
import { QcRuleService } from '../services/qc-rule.service';

@Component({
  selector: 'app-qc-qc-rule',
  templateUrl: './qc-rule.component.html',
  styleUrls: ['./qc-rule.component.less'],
})
export class QcQcRuleComponent implements OnInit {
  constructor(private http: _HttpClient,    
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService, 
    private messageService: NzMessageService,
    private qcRuleService: QcRuleService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    ) { 

}

listOfAllQCRules: QCRule[] = [];

searchResult = '';
isSpinning = false;
searchForm!: FormGroup; 

ngOnInit(): void { 

  this.searchForm = this.fb.group({
    name: [null], 
    }); 

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });

}
 

resetForm(): void {
  this.searchForm.reset();
  this.listOfAllQCRules = [];


}
 
search(): void {
  this.isSpinning = true;
  this.searchResult = '';
  this.qcRuleService.getQCRules(this.searchForm.controls.name.value).subscribe(
    {
      next: (qcRuleRes) => {
        this.listOfAllQCRules = qcRuleRes;

        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: qcRuleRes.length,
            });
      }, 
      error: () => this.isSpinning = false
    });

    
}

@ViewChild('st', { static: true })
st!: STComponent;
columns: STColumn[] = [

  { title: this.i18n.fanyi("name"), index: 'name', iif: () => this.isChoose('name') },
  { title: this.i18n.fanyi("description"), index: 'description', iif: () => this.isChoose('description') },
  {
    title: 'action',
    renderTitle: 'actionColumnTitle' ,
    render: 'actionColumn',
  },

];
customColumns = [

  { label: this.i18n.fanyi("name"), value: 'name', checked: true },
  { label: this.i18n.fanyi("description"), value: 'description', checked: true },

];

isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
}

columnChoosingChanged(): void{ 
  if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

  }
}

modifyQCRule(qcRule: QCRule) {
  // flow to maintenance page to modify the configuration
  this.router.navigateByUrl(
      `/qc/qc-rule/maintenance?id=${qcRule.id}`);
}
removeQCRule(qcRule: QCRule) { 
    this.isSpinning = true;
    this.qcRuleService.removeQCRule(qcRule)
    .subscribe({
      next: () => {
        this.isSpinning = false;
        this.search();

      }, 
      error: () =>  this.isSpinning = false
    });
}

}
