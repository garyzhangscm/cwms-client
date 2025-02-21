import { Component, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { TestScenarioStatus } from '../models/test-scenario-status.enum';
import { TestScenarioSuit } from '../models/test-scenario-suit';
import { TestScenarioSuitStatus } from '../models/test-scenario-suit-status.enum';
import { TestScenarioSuitService } from '../services/test-scenario-suit.service';

@Component({
    selector: 'app-util-tester',
    templateUrl: './tester.component.html',
    standalone: false
})
export class UtilTesterComponent implements OnInit {
  testScenarioSuit!: TestScenarioSuit;
  currentStep = 0;
  executing = false;
  checkingTestSuitJob: any;
  currentStepStatus = '';

  mapOfStepStatus: { [key: string]: string } = {};

  displayOnly = false;
  constructor(
    private userService: UserService,
    private testScenarioSuitService: TestScenarioSuitService,
    private messageService: NzMessageService,
    private i18n: I18NService,
  ) {
    userService.isCurrentPageDisplayOnly("/util/tester").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                            
  }

  ngOnInit(): void {
    this.testScenarioSuitService.getTestScenarioSuit().subscribe(res => {
      this.testScenarioSuit = res;
      this.testScenarioSuit.testScenarios.forEach(testScenario => {
        this.mapOfStepStatus[testScenario.name] = this.getStepStatus(testScenario.status);
      });
    });
    this.executing = false;
    this.currentStep = 0;
  }
  executeScenario(): void {
    this.executing = true;
    this.testScenarioSuitService.executeTestScenarioSuit().subscribe(res => {
      // refresh the status once every 1 second
      this.checkingTestSuitJob = setInterval(() => this.getCurrentStep(), 1000);
    });
  }
  getCurrentStep(): void {
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
