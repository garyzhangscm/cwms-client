import { ApplicationInformation } from './application-information';
import { User } from './user';
import { MenuGroup } from './menu-group';

export interface SiteInformation {
  applicationInformation: ApplicationInformation;

  user: User;
  menuGroups: MenuGroup[];
}
