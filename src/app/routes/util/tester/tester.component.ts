import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { TestScenarioSuit } from '../models/test-scenario-suit';
import { TestScenarioSuitService } from '../services/test-scenario-suit.service';
import { TestScenarioStatus } from '../models/test-scenario-status.enum';
import { TestScenarioSuitStatus } from '../models/test-scenario-suit-status.enum';
import { NzMessageService } from 'ng-zorro-antd/message';
import { I18NService } from '@core';

@Component({
  selector: 'app-util-tester',
  templateUrl: './tester.component.html',
})
export class UtilTesterComponent implements OnInit {
  testScenarioSuit: TestScenarioSuit;
  currentStep: number;
  executing: boolean;
  checkingTestSuitJob: any;
  currentStepStatus: string;

  mapOfStepStatus: { [key: string]: string } = {};

  constructor(
    private http: _HttpClient,
    private testScenarioSuitService: TestScenarioSuitService,
    private messageService: NzMessageService,
    private i18n: I18NService,
  ) {}

  ngOnInit() {
    this.testScenarioSuitService.getTestScenarioSuit().subscribe(res => {
      this.testScenarioSuit = res;
      this.testScenarioSuit.testScenarios.forEach(testScenario => {
        this.mapOfStepStatus[testScenario.name] = this.getStepStatus(testScenario.status);
      });
    });
    this.executing = false;
    this.currentStep = 0;
  }
  executeScenario() {
    this.executing = true;
    this.testScenarioSuitService.executeTestScenarioSuit().subscribe(res => {
      // refresh the status once every 1 second
      this.checkingTestSuitJob = setInterval(() => this.getCurrentStep(), 1000);
    });
  }
  getCurrentStep() {
    this.testScenarioSuitService.getTestScenarioSuit().subscribe(res => {
      console.log(`getCurrentStep: ${JSON.stringify(res)}`);
      res.testScenarios.forEach((testScenario, index) => {
        this.mapOfStepStatus[testScenario.name] = this.getStepStatus(testScenario.status);
      });

      if (res.status === TestScenarioSuitStatus.COMPLETED || res.status === TestScenarioSuitStatus.FAILED) {
        clearInterval(this.checkingTestSuitJob);
        console.log(`clearInterval`);
        this.executing = false;
        if (res.status === TestScenarioSuitStatus.COMPLETED) {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
        } else {
          this.messageService.error(this.i18n.fanyi('message.action.fail'));
        }
      }
    });
  }

  getStepStatus(testScenarioStatus: TestScenarioStatus): string {
    let status: string;
    switch (testScenarioStatus) {
      case TestScenarioStatus.PENDING:
        status = 'wait';
        break;
      case TestScenarioStatus.COMPLETED:
        status = 'finish';
        break;
      case TestScenarioStatus.FAILED:
        status = 'error';
        break;
      case TestScenarioStatus.RUNNING:
        status = 'process';
        break;
    }
    return status;
  }
}
