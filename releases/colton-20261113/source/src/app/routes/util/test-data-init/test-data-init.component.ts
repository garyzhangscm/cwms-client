import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { TestDataUploadService } from '../services/test-data-upload.service';
import { WebClientConfigurationService } from '../services/web-client-configuration.service';

@Component({
    selector: 'app-util-test-data-init',
    templateUrl: './test-data-init.component.html',
    standalone: false
})
export class UtilTestDataInitComponent implements OnInit {
  dataNames: string[] = [];
  currentStep = 0;
  loadButtonDisabled: boolean;
  loadButtonLoading: boolean;
  clearButtonDisabled: boolean;
  clearButtonLoading: boolean;

  constructor(private http: _HttpClient, 
    private testDataUploadService: TestDataUploadService, 
    private webClientConfigurationService: WebClientConfigurationService) {
    this.loadButtonDisabled = true;
    this.loadButtonLoading = false;
    this.clearButtonDisabled = true;
    this.clearButtonLoading = false;
  }

  ngOnInit(): void {
    this.testDataUploadService.getTestDataNames().subscribe(res => {
      this.dataNames = res;
      this.currentStep = 0;
      this.loadButtonDisabled = false;
      this.loadButtonLoading = false;

      this.clearButtonDisabled = false;
      this.clearButtonLoading = false;
    });
  }
  loadData(index: number): void {
    this.loadButtonDisabled = true;
    this.loadButtonLoading = true;
    this.clearButtonDisabled = true;
    this.clearButtonLoading = true;

    this.currentStep = index;
    if (index < this.dataNames.length) {
      this.testDataUploadService.loadTestData(this.dataNames[index]).subscribe(
        res => {
          console.log(`#${  index  } - ${  this.dataNames[index]  } is done!`);
          console.log(`>> Result: ${  JSON.stringify(res)}`);
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
      // all data is loaded
      this.loadButtonDisabled = false;
      this.loadButtonLoading = false;
      this.clearButtonDisabled = false;
      this.clearButtonLoading = false;

      // refresh the client cache
      console.log("=======     Test Data Loaded   =======");
      this.webClientConfigurationService.loadWebClientConfiguration().subscribe(
        configuration =>{
          console.log(`get web configuration: ${JSON.stringify(configuration)}`);
          
          this.webClientConfigurationService.setWebClientConfiguration(configuration);
          // console.log(`webClientConfigurationService saved!: ${JSON.stringify(this.webClientConfigurationService.getWebClientConfiguration())}`);
        }
      );

    }
  }

  clearData(): void {
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
