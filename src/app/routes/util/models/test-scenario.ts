import { TestScenarioStatus } from './test-scenario-status.enum';

export interface TestScenario {
  name: string;
  description: string;
  warehouseName: string;

  status: TestScenarioStatus;
}
