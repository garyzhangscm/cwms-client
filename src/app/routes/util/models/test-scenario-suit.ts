import { TestScenario } from './test-scenario';
import { TestScenarioSuitStatus } from './test-scenario-suit-status.enum';

export interface TestScenarioSuit {
  testScenarios: TestScenario[];
  currentTestScenario: TestScenario;
  status: TestScenarioSuitStatus;
  startDateTime: number[];
  endDateTime: number[];
}
