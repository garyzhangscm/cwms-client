import { UnitType } from "./unit-type";

export interface Unit {
    id?: number;
    type: UnitType;

    name: string;
    description: string;
    
    ratio: number;

    baseUnitFlag: boolean;
}
