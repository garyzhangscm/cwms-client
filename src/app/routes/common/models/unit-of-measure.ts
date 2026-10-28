export type UnitOfMeasureLevel = 'ITEM' | 'CASE' | 'PALLET';

export interface UnitOfMeasure {
  level?: UnitOfMeasureLevel | null;
  id?: number;
  _testRevision?: number;
  name: string;
  description: string;
  warehouseId?: number;
  companyId: number;
}
