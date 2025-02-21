import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';

export interface ColumnItem<T> {
  name: string;
  showSort?: boolean;
  sortOrder: NzTableSortOrder | null;
  sortFn: NzTableSortFn<T> | null;
  listOfFilter: NzTableFilterList;
  filterFn: NzTableFilterFn<T> | null;
  filterMultiple: boolean;
  sortDirections: NzTableSortOrder[];
  showFilter: boolean;
  rowspan?: number;
  colspan?: number;
  width?: string;
  fixToTheLeft?: boolean;
  fixToTheRight?: boolean;

}
