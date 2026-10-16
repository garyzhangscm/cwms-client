import { inject as injectWebI18n } from '@angular/core';
import { I18NService as WebI18nService } from '@core';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { QuickbookEntity } from '../models/quickbook-entity.enum';
import { QuickbookOnlineToken } from '../models/quickbook-online-token';
import { QuickbookService } from '../services/quickbook.service';

@Component({
    selector: 'app-util-quickbook-auth',
    templateUrl: './quickbook-auth.component.html',
    standalone: false
})
export class UtilQuickbookAuthComponent implements OnInit {
  private readonly webI18n = injectWebI18n(WebI18nService);

  isSpinning = false;
  
  currentQBOToken: QuickbookOnlineToken;
  quickbookEntities = QuickbookEntity;
  quickbookEntitiesKeys = Object.keys(this.quickbookEntities);
  currentSyncEntity: QuickbookEntity = QuickbookEntity.Vendor;
  syncTransactionDays: number = 1;

  payload = "";
  signature = "";

  displayOnly = false;
  constructor(private http: _HttpClient, 
    private quickbookService: QuickbookService, 
    private messageService: NzMessageService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/util/quickbook-auth").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                     

      this.currentQBOToken = {

      }
    }

    
  searchForm!: UntypedFormGroup;
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      authCode: [null],
      
      realmId: [null]
    });
    this.loadCurrentToken();
 }

 loadCurrentToken() {
   this.isSpinning = true;
   this.quickbookService.getCurrentToken().subscribe({
     next: (tokenRes) => {
        if (tokenRes != null) {
          this.currentQBOToken = tokenRes;
        }
        else {
          this.currentQBOToken = {};
        }
        this.displayCurrentToken();
        this.isSpinning = false;
     }, 
     error: () => {
       this.isSpinning = false;
       this.displayCurrentToken();
      }

   })

 }
 displayCurrentToken() {
   
  this.searchForm.value.authCode.setValue(this.currentQBOToken.authorizationCode);
  this.searchForm.value.realmId.setValue(this.currentQBOToken.realmId);
 }
 requestToken(): void {
    this.isSpinning = true;
    this.quickbookService.requestToken(this.searchForm.value.authCode, this.searchForm.value.realmId).subscribe(
      {
        next: (tokenRes) => {
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.16e191e5ab75'));
          this.currentQBOToken = tokenRes;
          this.displayCurrentToken();
          
          
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.ee51210a3541'));
          this.currentQBOToken = {};
          this.displayCurrentToken();
        }
      }
    )

  }
  
 refreshToken(): void {
    this.isSpinning = true;
    this.quickbookService.refreshToken(this.searchForm.value.realmId).subscribe(
      {
        next: (tokenRes) => {
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.16e191e5ab75'));
          this.currentQBOToken = tokenRes;
          this.displayCurrentToken();
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.ee51210a3541'));
          this.currentQBOToken = {};
          this.displayCurrentToken();
        }
      }
    )

  }

  syncEntity() {
    this.isSpinning = true;
    console.log(`start to sync entity ${this.currentSyncEntity}`);
    this.quickbookService.syncEntity(this.currentSyncEntity, this.syncTransactionDays).subscribe(
      {
        next: (affectEntityNumber) => {
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.13becbf80de9'));

          console.log(`sync ${affectEntityNumber} ${this.currentSyncEntity}`);
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.01e16d8e2e3d'));
        }
      }
    )

  }

  sendWebhook() {
    this.isSpinning = true;
    console.log(`start to send web hook request \n payload: ${this.payload}`);
    this.quickbookService.sendWebhook(this.signature, this.payload).subscribe(
      {
        next: () => {
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.6ada3e7f6990'));
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.webI18n.fanyi('web.message.1d40e2f745d8'));
        }
      }
    )

  }
}
