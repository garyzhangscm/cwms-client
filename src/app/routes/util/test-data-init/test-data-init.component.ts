import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { TestDataUploadService } from '../services/test-data-upload.service';

@Component({
  selector: 'app-util-test-data-init',
  templateUrl: './test-data-init.component.html',
})
export class UtilTestDataInitComponent implements OnInit {
  dataNames: string[];
  currentStep: number;
  loadButtonDisabled: boolean;
  loadButtonLoading: boolean;
  constructor(private http: _HttpClient, private testDataUploadService: TestDataUploadService) {
    this.loadButtonDisabled = true;
    this.loadButtonLoading = false;
  }

  ngOnInit() {
    this.testDataUploadService.getTestDataNames().subscribe(res => {
      this.dataNames = res;
      this.currentStep = 0;
      this.loadButtonDisabled = false;
      this.loadButtonLoading = false;
    });
  }
  loadData(index) {
    this.loadButtonDisabled = true;
    this.loadButtonLoading = true;
    this.currentStep = index;
    if (index < this.dataNames.length) {
      this.testDataUploadService.loadTestData(this.dataNames[index]).subscribe(res => {
        console.log('#' + index + ' - ' + this.dataNames[index] + ' is done!');
        console.log('>> Result: ' + JSON.stringify(res));
        this.loadData(index + 1);
      });
    } else {
      this.loadButtonDisabled = false;
      this.loadButtonLoading = false;
    }
  }
}
