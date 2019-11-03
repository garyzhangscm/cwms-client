export interface LocationGroupType {
  id: number;
  name: string;
  description: string;
  four_wall_inventory: boolean;
  virtual: boolean;
  compatible: LocationGroupType[];
  pickable: boolean;
}
