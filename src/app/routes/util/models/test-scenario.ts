import { TestScenarioStatus } from './test-scenario-status.enum';

export interface TestScenario {
  name: string;
  warehouseName: string;

  status: TestScenarioStatus;
}
