export interface Menu {
  // Menu Group and sub Group string representitive
  // for display purpose only
  menuGroup?: string;
  menuSubGroup?: string;
  id: number;
  text: string;
  i18n: string;
  link: string;
  sequence: number;
  overallSequence?: number;
  enabled?: boolean;
  systemAdminMenuFlag?: boolean;
  name: string;
}
