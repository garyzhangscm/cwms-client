import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { QuickbookOnlineToken } from '../models/quickbook-online-token';
import { QuickbookService } from '../services/quickbook.service';

@Component({
  selector: 'app-util-quickbook-auth',
  templateUrl: './quickbook-auth.component.html',
})
export class UtilQuickbookAuthComponent implements OnInit {

  isSpinning = false;
  
  currentQBOToken: QuickbookOnlineToken;

  constructor(private http: _HttpClient, 
    private quickbookService: QuickbookService, 
    private messageService: NzMessageService,
    private fb: FormBuilder,) { 
      this.currentQBOToken = {

      }
    }

    
  searchForm!: FormGroup;
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
   
  this.searchForm.controls.authCode.setValue(this.currentQBOToken.authorizationCode);
  this.searchForm.controls.realmId.setValue(this.currentQBOToken.realmId);
 }
 requestToken(): void {
    this.isSpinning = true;
    this.quickbookService.requestToken(this.searchForm.value.authCode, this.searchForm.value.realmId).subscribe(
      {
        next: (tokenRes) => {
          this.isSpinning = false;
          this.messageService.success("auth success");
          this.currentQBOToken = tokenRes;
          this.displayCurrentToken();
          
          
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success("auth fail");
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
          this.messageService.success("auth success");
          this.currentQBOToken = tokenRes;
          this.displayCurrentToken();
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success("auth fail");
          this.currentQBOToken = {};
          this.displayCurrentToken();
        }
      }
    )

  }
}
