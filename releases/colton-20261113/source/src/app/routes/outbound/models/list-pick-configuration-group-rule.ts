import { ListPickConfiguration } from "./list-pick-configuration";
import { ListPickGroupRuleType } from "./list-pick-group-rule-type.enum";
 

export interface ListPickConfigurationGroupRule {
    id?: number;


    listPickConfiguration?: ListPickConfiguration;

    groupRuleType: ListPickGroupRuleType;
}
