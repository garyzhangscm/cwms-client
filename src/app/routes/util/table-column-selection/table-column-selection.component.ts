import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-util-table-column-selection',
  templateUrl: './table-column-selection.component.html',
})
export class UtilTableColumnSelectionComponent implements OnInit {
 
  columnChoosingModal!: NzModalRef;
   /**
     * 自定义model变量
     */
   _myModel: any;
    
    /**
     * 返回父组件变化后的值
     */
    @Input()
    get myModel() {
        return this._myModel;
    }

    /**
     * 组件值产生变化后父组件改变
     *
     * @param value
     */
    set myModel(value) { 
        this._myModel = value;
        this.myModelChange.emit(value);
    }
    columnChanged() {
       
      this.myModelChange.emit(this._myModel);
    }
    @Output()
    readonly myModelChange: EventEmitter<any> = new EventEmitter();

    constructor(private http: _HttpClient,
      private modalService: NzModalService,
      @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { }
    // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
    ngOnInit() {
    } 
    
    openColumnChoosingModal( 
      tplColumnChoosingModalTitle: TemplateRef<{}>,
      tplColumnChoosingContent: TemplateRef<{}>,
  ): void {
     
    // Load the location
    this.columnChoosingModal = this.modalService.create({
      nzTitle: tplColumnChoosingModalTitle,
      nzContent: tplColumnChoosingContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.columnChoosingModal.destroy(); 
      },
      nzOnOk: () => {
        this.columnChoosingModal.destroy(); 
      },

      nzWidth: 1000,
    });
  }

}
