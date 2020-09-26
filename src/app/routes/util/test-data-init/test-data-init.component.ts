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
  clearButtonDisabled: boolean;
  clearButtonLoading: boolean;

  constructor(private http: _HttpClient, private testDataUploadService: TestDataUploadService) {
    this.loadButtonDisabled = true;
    this.loadButtonLoading = false;
    this.clearButtonDisabled = true;
    this.clearButtonLoading = false;
  }

  ngOnInit() {
    this.testDataUploadService.getTestDataNames().subscribe(res => {
      this.dataNames = res;
      this.currentStep = 0;
      this.loadButtonDisabled = false;
      this.loadButtonLoading = false;

      this.clearButtonDisabled = false;
      this.clearButtonLoading = false;
    });
  }
  loadData(index) {
    this.loadButtonDisabled = true;
    this.loadButtonLoading = true;
    this.clearButtonDisabled = true;
    this.clearButtonLoading = true;

    this.currentStep = index;
    if (index < this.dataNames.length) {
      this.testDataUploadService.loadTestData(this.dataNames[index]).subscribe(
        res => {
          console.log('#' + index + ' - ' + this.dataNames[index] + ' is done!');
          console.log('>> Result: ' + JSON.stringify(res));
          this.loadData(index + 1);
        },
        () => {
          this.loadButtonDisabled = false;
          this.loadButtonLoading = false;
          this.clearButtonDisabled = false;
          this.clearButtonLoading = false;
        },
      );
    } else {
      this.loadButtonDisabled = false;
      this.loadButtonLoading = false;
      this.clearButtonDisabled = false;
      this.clearButtonLoading = false;
    }
  }

  clearData() {
    this.loadButtonDisabled = true;
    this.loadButtonLoading = true;
    this.clearButtonDisabled = true;
    this.clearButtonLoading = true;
    this.testDataUploadService.clearAll().subscribe(
      res => {
        console.log('>> clear test data is cleared');
        this.loadButtonDisabled = false;
        this.loadButtonLoading = false;
        this.clearButtonDisabled = false;
        this.clearButtonLoading = false;
      },
      () => {
        this.loadButtonDisabled = false;
        this.loadButtonLoading = false;
        this.clearButtonDisabled = false;
        this.clearButtonLoading = false;
      },
    );
  }
}
