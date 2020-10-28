import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';

export interface ColumnItem {
  name: string;
  showSort?: boolean;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
  showFilter: boolean;
  rowspan?: number;
  colspan?: number;
  width?: string;
  fixToTheLeft?: boolean;
  fixToTheRight?: boolean;

}
