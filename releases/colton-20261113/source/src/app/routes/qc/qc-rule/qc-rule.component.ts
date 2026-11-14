import { formatDate } from '@angular/common';
import { finalize, timeout } from 'rxjs';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service'; 
import { QCRule } from '../models/qc-rule';
import { QcRuleService } from '../services/qc-rule.service';

@Component({
    selector: 'app-qc-qc-rule',
    templateUrl: './qc-rule.component.html',
    styleUrls: ['./qc-rule.component.less'],
    standalone: false
})
export class QcQcRuleComponent implements OnInit {
  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  private readonly fb = inject(FormBuilder);
  
  searchForm = this.fb.nonNullable.group({
    name: this.fb.control('', { nonNullable: true, validators: []}),  
  });
 

  displayOnly = false;
  constructor(  
 
    private qcRuleService: QcRuleService,
    private userService: UserService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    ) { 
      userService.isCurrentPageDisplayOnly("/qc/rules").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );        

}

listOfAllQCRules: QCRule[] = [];

searchResult = '';
removeMessage = '';
isSpinning = false; 

ngOnInit(): void { 


    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {
        this.searchForm.controls.name.setValue(params['name']);
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
  this.qcRuleService.getQCRules(this.searchForm.value.name)
    .pipe(timeout(30000), finalize(() => this.isSpinning = false)).subscribe(
    {
      next: (qcRuleRes) => {
        this.listOfAllQCRules = qcRuleRes;
        this.st?.reload();

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
    iif: () => !this.displayOnly
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
  if (this.isSpinning || this.displayOnly || !qcRule.id) return;
  this.isSpinning = true;
  this.removeMessage = '';
  let confirmed = false;
  this.qcRuleService.removeQCRule(qcRule)
    .pipe(timeout(30000), finalize(() => this.isSpinning = false))
    .subscribe({
      next: () => {
        confirmed = true;
        this.listOfAllQCRules = this.listOfAllQCRules.filter(rule => rule.id !== qcRule.id);
        this.st?.reload();
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: this.listOfAllQCRules.length,
        });
        this.removeMessage = this.i18n.fanyi('qc-rule.removed', {name: qcRule.name});
      },
      error: (error: {statusText?: string}) => {
        const referenced = /foreign key|constraint|referenc|in use/i.test(error?.statusText || '');
        this.removeMessage = this.i18n.fanyi(referenced ? 'qc-rule.in-use' : 'qc-rule.remove-unknown', {name: qcRule.name});
      },
      complete: () => {
        if (!confirmed) this.removeMessage = this.i18n.fanyi('qc-rule.remove-unknown', {name: qcRule.name});
      }
    });
}

}
