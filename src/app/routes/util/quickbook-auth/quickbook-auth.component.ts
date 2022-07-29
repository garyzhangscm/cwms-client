import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { QuickbookService } from '../services/quickbook.service';

@Component({
  selector: 'app-util-quickbook-auth',
  templateUrl: './quickbook-auth.component.html',
})
export class UtilQuickbookAuthComponent implements OnInit {

  isSpinning = false;
  token = "N/A";
  refreshToken = "N/A"

  constructor(private http: _HttpClient, 
    private quickbookService: QuickbookService, 
    private messageService: NzMessageService,
    private fb: FormBuilder,) { }

    searchForm!: FormGroup;
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      authCode: [null],
      
      realmId: [null]
    });
 }

 getToken(): void {
    this.isSpinning = true;
    this.quickbookService.getToken(this.searchForm.value.authCode, this.searchForm.value.realmId).subscribe(
      {
        next: (tokenRes) => {
          this.isSpinning = false;
          this.messageService.success("auth success");
          const tokenObj = JSON.parse(tokenRes)
          this.token  = tokenObj.access_token;
          this.refreshToken  = tokenObj.refresh_token;
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success("auth fail");
          this.token  = "N/A";
          this.refreshToken  = "N/A";
        }
      }
    )

  }
  
 getRefreshToken(): void {
  this.isSpinning = true;
  this.quickbookService.refreshToken(this.searchForm.value.realmId).subscribe(
    {
      next: (tokenRes) => {
        this.isSpinning = false;
        this.messageService.success("auth success");
        const tokenObj = JSON.parse(tokenRes)
        this.token  = tokenObj.access_token;
        this.refreshToken  = tokenObj.refresh_token;
      }, 
      error: () => {
        
        this.isSpinning = false;
        this.messageService.success("auth fail");
        this.token  = "N/A";
        this.refreshToken  = "N/A";
      }
    }
  )

}
}
