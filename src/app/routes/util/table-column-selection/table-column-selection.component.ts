import { Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import { WebPageTableColumnConfiguration } from '../models/web-page-table-column-configuration';
import { WebPageTableColumnConfigurationService } from '../services/web-page-table-column-configuration.service';
import { tap } from 'rxjs';
import { LocalCacheService } from '../services/local-cache.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { UserService } from '../../auth/services/user.service';

@Component({
    selector: 'app-util-table-column-selection',
    templateUrl: './table-column-selection.component.html',
    styleUrls: ['./table-column-selection.component.less'],
    standalone: false
})
export class UtilTableColumnSelectionComponent implements OnInit {
 
  columnChoosingModal!: NzModalRef;
   /**
     * 自定义model变量
     */
   _tableColumnsConfiguration: WebPageTableColumnConfiguration[] = [];
    
    /**
     * 返回父组件变化后的值
     */
    @Input()
    get tableColumnsConfiguration() {
        return this._tableColumnsConfiguration;
    }

    /**
     * 组件值产生变化后父组件改变
     *
     * @param value
     */
    set tableColumnsConfiguration(value) { 
        this._tableColumnsConfiguration = value;
        this.tableColumnConfigurationChanged.emit(value);
    }

    saveChangedWebPageTableColumnConfigurations() {
 
      // we will save the web page table conlumn and then save it locally
      
      let companyId = this.companyService.getCurrentCompany()?.id;  
      let username = this.userService.getCurrentUsername();
      let webPageName = this._tableColumnsConfiguration[0].webPageName;
      let tableName = this._tableColumnsConfiguration[0].tableName;
      
      const cacheKey = `web-page-table-column-config-${companyId}-${username}-${webPageName}-${tableName}`;
      this.webPageTableColumnConfigurationService.addWebPageTableColumnConfigurations(this._tableColumnsConfiguration)
      .pipe(tap(res => this.localCacheService.save({
           key: cacheKey,
           data: res,
           expirationMins: this.localCacheService.defaultCacheTime
       }))).subscribe({
        next: () => {
          console.log(`success!`)
        }
       })
    }

    columnChanged() {
       // let's reset all the index of the table columns based on the result
       // from the index of the list
       let sequence = 1;
       this._tableColumnsConfiguration.forEach(
        column => {
          column.columnSequence = sequence;
          sequence++;
        }
       );
       this.saveChangedWebPageTableColumnConfigurations()

      this.tableColumnConfigurationChanged.emit(this._tableColumnsConfiguration);
    }
    @Output()
    readonly tableColumnConfigurationChanged: EventEmitter<any> = new EventEmitter();

    constructor(private http: _HttpClient,
      private modalService: NzModalService,
      private localCacheService: LocalCacheService,
      private companyService: CompanyService,
      private userService: UserService,
      private webPageTableColumnConfigurationService: WebPageTableColumnConfigurationService,
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
        this.columnChanged();
        this.columnChoosingModal.destroy(); 
      },

      nzWidth: 1000,
    });
  }

  
  drop(event: CdkDragDrop<string[]>) {
    /**
    moveItemInArray(this._tableColumnsConfiguration, event.previousIndex, event.currentIndex);
     * 
     */
    moveItemInArray(this._tableColumnsConfiguration, event.previousIndex, event.currentIndex);
    this._tableColumnsConfiguration.forEach((tableColumnsConfiguration, idx) => {
      tableColumnsConfiguration.columnSequence = idx + 1;
    });
  }

}
