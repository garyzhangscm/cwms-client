import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { User } from '../../auth/models/user';

export interface WebPageTableColumnConfiguration {
    id?: number;
    companyId: number;

    // user?: User;
    webPageName: string;
    tableName: string;
    columnName: string;
    columnDisplayText: string;
    
    columnWidth: number;
    columnSequence: number;

    displayFlag: boolean;

}
