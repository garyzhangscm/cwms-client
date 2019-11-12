import { Client } from '../../common/models/client';
import { ItemFamily } from './item-family';

export interface Item {
  id: number;
  name: string;
  client: Client;
  itemFamily: ItemFamily;
}
